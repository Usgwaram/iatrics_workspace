import 'package:flutter/material.dart';

import 'feedback_service.dart';

class FeedbackScreen extends StatefulWidget {
  final int? consultationId;
  final int? providerId;

  const FeedbackScreen({
    super.key,
    this.consultationId,
    this.providerId,
  });

  @override
  State<FeedbackScreen> createState() => _FeedbackScreenState();
}

class _FeedbackScreenState extends State<FeedbackScreen> {
  final service = FeedbackService();
  final commentController = TextEditingController();
  final complaintController = TextEditingController();
  String category = 'Clinical';
  int rating = 5;
  bool isLoading = false;
  List<Map<String, dynamic>> complaints = [];

  @override
  void initState() {
    super.initState();
    loadComplaints();
  }

  @override
  void dispose() {
    commentController.dispose();
    complaintController.dispose();
    super.dispose();
  }

  Future<void> loadComplaints() async {
    try {
      final data = await service.getComplaints();
      if (mounted) setState(() => complaints = data);
    } catch (_) {}
  }

  Future<void> submitReview() async {
    if (widget.providerId == null) return;
    await _run(() {
      return service.createReview(
        providerId: widget.providerId!,
        rating: rating,
        comment: commentController.text.trim(),
      );
    }, 'Review submitted');
  }

  Future<void> submitComplaint() async {
    if (widget.consultationId == null) return;
    await _run(() {
      return service.createComplaint(
        consultationId: widget.consultationId!,
        category: category,
        message: complaintController.text.trim(),
      );
    }, 'Complaint submitted');
    await loadComplaints();
  }

  Future<void> _run(Future<void> Function() action, String success) async {
    setState(() => isLoading = true);

    try {
      await action();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(success)),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString().replaceAll('Exception:', ''))),
      );
    } finally {
      if (mounted) setState(() => isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Reviews & Complaints')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          if (widget.providerId != null) ...[
            Text('Review provider',
                style: Theme.of(context).textTheme.titleMedium),
            Slider(
              min: 1,
              max: 5,
              divisions: 4,
              label: rating.toString(),
              value: rating.toDouble(),
              onChanged: (value) => setState(() => rating = value.round()),
            ),
            TextField(
              controller: commentController,
              decoration: const InputDecoration(labelText: 'Comment'),
            ),
            const SizedBox(height: 12),
            ElevatedButton(
              onPressed: isLoading ? null : submitReview,
              child: const Text('Submit Review'),
            ),
          ],
          if (widget.consultationId != null) ...[
            const SizedBox(height: 28),
            Text('Raise complaint',
                style: Theme.of(context).textTheme.titleMedium),
            DropdownButton<String>(
              value: category,
              items: const ['Clinical', 'Payment', 'Provider', 'Technical']
                  .map((item) => DropdownMenuItem(
                        value: item,
                        child: Text(item),
                      ))
                  .toList(),
              onChanged: (value) {
                if (value != null) setState(() => category = value);
              },
            ),
            TextField(
              controller: complaintController,
              maxLines: 4,
              decoration: const InputDecoration(
                labelText: 'Message',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            ElevatedButton(
              onPressed: isLoading ? null : submitComplaint,
              child: const Text('Submit Complaint'),
            ),
          ],
          const SizedBox(height: 28),
          Text('My complaints', style: Theme.of(context).textTheme.titleMedium),
          ...complaints.map((complaint) {
            return ListTile(
              contentPadding: EdgeInsets.zero,
              title: Text(complaint['category'] ?? 'Complaint'),
              subtitle: Text(complaint['message'] ?? ''),
              trailing: Text(complaint['status'] ?? 'open'),
            );
          }),
        ],
      ),
    );
  }
}

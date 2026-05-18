import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';

import '../../utils/auth_token.dart';
import '../../utils/network_config.dart';

class ConsultationFileUploadScreen extends StatefulWidget {
  final int consultationId;

  const ConsultationFileUploadScreen({
    super.key,
    required this.consultationId,
  });

  @override
  State<ConsultationFileUploadScreen> createState() =>
      _ConsultationFileUploadScreenState();
}

class _ConsultationFileUploadScreenState
    extends State<ConsultationFileUploadScreen> {
  bool isLoading = false;

  Future<void> pickAndUpload() async {
    final picker = ImagePicker();
    final file = await picker.pickMedia();

    if (file == null) return;

    setState(() => isLoading = true);

    try {
      final token = await AuthToken.getToken();
      if (token == null || token.isEmpty) {
        throw Exception('Please log in again');
      }

      final request = http.MultipartRequest(
        'POST',
        Uri.parse(
          '${NetworkConfig.baseUrl}/api/uploads/consultation/${widget.consultationId}',
        ),
      );
      request.headers['Authorization'] = 'Bearer $token';
      request.files.add(await http.MultipartFile.fromPath('file', file.path));

      final response = await request.send();

      if (response.statusCode >= 400) {
        throw Exception('Upload failed');
      }

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('File uploaded')),
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
      appBar: AppBar(title: const Text('Upload File')),
      body: Center(
        child: ElevatedButton.icon(
          onPressed: isLoading ? null : pickAndUpload,
          icon: const Icon(Icons.upload_file),
          label: Text(isLoading ? 'Uploading...' : 'Choose File'),
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:iatrics_provider_app/core/services/admin_api.dart';

class WithdrawalsScreen extends StatefulWidget {
  const WithdrawalsScreen({super.key});

  @override
  State<WithdrawalsScreen> createState() => _WithdrawalsScreenState();
}

class _WithdrawalsScreenState extends State<WithdrawalsScreen> {
  final api = AdminApi();
  List withdrawals = [];

  @override
  void initState() {
    super.initState();
    load();
  }

  void load() async {
    final data = await api.getWithdrawals();
    setState(() => withdrawals = data);
  }

  void approve(String id) async {
    await api.approveWithdrawal(id);
    load();
  }

  void reject(String id) async {
    await api.rejectWithdrawal(id);
    load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Withdrawals")),
      body: ListView.builder(
        itemCount: withdrawals.length,
        itemBuilder: (_, i) {
          final w = withdrawals[i];

          return Card(
            child: ListTile(
              title: Text("₦${w['amount']} - ${w['status']}"),
              subtitle: Text(
                "Acc: ${w['accountNumber']} | ${w['bankName']}",
              ),
              ElevatedButton(
                onPressed: () async {
                  await api.approveWithdrawal(item['id'].toString());
                  load(); // refresh
                },
                child: Text("Approve"),
              ),

              ElevatedButton(
                onPressed: () async {
                  await api.rejectWithdrawal(item['id'].toString());
                  load();
                },
                child: Text("Reject"),
              ),
              trailing: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  IconButton(
                    icon: const Icon(Icons.check, color: Colors.green),
                    onPressed: () => approve(w['id'].toString()),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.red),
                    onPressed: () => reject(w['id'].toString()),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
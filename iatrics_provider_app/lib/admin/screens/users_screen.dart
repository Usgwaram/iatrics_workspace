import 'package:flutter/material.dart';
import 'package:iatrics_provider_app/core/services/admin_api.dart';

class UsersScreen extends StatefulWidget {
  const UsersScreen({super.key});

  @override
  State<UsersScreen> createState() => _UsersScreenState();
}

class _UsersScreenState extends State<UsersScreen> {
  final api = AdminApi();
  List providers = [];

  @override
  void initState() {
    super.initState();
    load();
  }

  void load() async {
    final data = await api.getUsers();
    setState(() => users = data);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Users")),
      body: ListView.builder(
        itemCount: users.length,
        itemBuilder: (_, i) {
          final p = users[i];

          return ListTile(
            title: Text("User #${p['id']}"),
            subtitle: Text("Wallet balance: ₦${p['balance'] ?? 0}"),
          );
        },
      ),
    );
  }
}
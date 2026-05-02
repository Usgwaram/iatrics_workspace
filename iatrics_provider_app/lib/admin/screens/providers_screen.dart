import 'package:flutter/material.dart';
import 'package:iatrics_provider_app/core/services/admin_api.dart';

class ProvidersScreen extends StatefulWidget {
  const ProvidersScreen({super.key});

  @override
  State<ProvidersScreen> createState() => _ProvidersScreenState();
}

class _ProvidersScreenState extends State<ProvidersScreen> {
  final api = AdminApi();
  List providers = [];

  @override
  void initState() {
    super.initState();
    load();
  }

  void load() async {
    final data = await api.getProviders();
    setState(() => providers = data);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Providers")),
      body: ListView.builder(
        itemCount: providers.length,
        itemBuilder: (_, i) {
          final p = providers[i];

          return ListTile(
            title: Text("Provider #${p['id']}"),
            subtitle: Text("Wallet: ₦${p['balance'] ?? 0}"),
          );
        },
      ),
    );
  }
}
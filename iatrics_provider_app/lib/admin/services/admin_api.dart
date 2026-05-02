import 'dart:convert';
import 'package:http/http.dart' as http;

class AdminApi {
  final String baseUrl = "http://YOUR_IP:5002/api";
  final String token;

  AdminApi(this.token);

  Map<String, String> get headers => {
    "Authorization": "Bearer $token",
    "Content-Type": "application/json",
  };

  // ======================
  // 📊 FINANCIAL SUMMARY
  // ======================
  Future<Map<String, dynamic>> getSummary() async {
    final res = await http.get(
      Uri.parse("$baseUrl/admin/finance/summary"),
      headers: headers,
    );

    return jsonDecode(res.body);
  }

  final String baseUrl = "http://YOUR_IP:5002/api";

// ======================
// 💸 WITHDRAWALS
// ======================
  Future getWithdrawals() async {
    final res = await http.get(Uri.parse("$baseUrl/admin/finance/withdrawals"));
    return jsonDecode(res.body);
  }

  Future approveWithdrawal(String id) async {
    return await http.post(
      Uri.parse("$baseUrl/admin/finance/withdrawals/$id/approve"),
    );
  }

  Future rejectWithdrawal(String id) async {
    return await http.post(
      Uri.parse("$baseUrl/admin/finance/withdrawals/$id/reject"),
    );
  }
  // ======================
  // 👤 USERS
  // ======================
  Future getUsers() async {
    final res = await http.get(
      Uri.parse("$baseUrl/users"),
      headers: headers,
    );
    return jsonDecode(res.body);
  }

  // ======================
  // 👨‍⚕️ PROVIDERS
  // ======================
  Future getProviders() async {
    final res = await http.get(
      Uri.parse("$baseUrl/providers"),
      headers: headers,
    );
    return jsonDecode(res.body);
  }
}
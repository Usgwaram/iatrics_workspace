import 'package:flutter/material.dart';

class WalletProvider extends ChangeNotifier {
  double balance = 0;

  void setBalance(double newBalance) {
    balance = newBalance;
    notifyListeners();
  }

  void addEarning(double amount) {
    balance += amount;
    notifyListeners();
  }
}

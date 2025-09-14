import 'package:flutter/material.dart';

class AppTheme {
  static const Color primary = Color(0xFF2763DC);
  static ThemeData light() {
    return ThemeData(
      colorScheme: ColorScheme.fromSeed(seedColor: primary),
      useMaterial3: true,
      scaffoldBackgroundColor: Colors.white,
      textTheme: const TextTheme(bodyMedium: TextStyle(fontSize: 14)),
    );
  }
}


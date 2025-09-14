import 'package:flutter/material.dart';
import '../services/api.dart';

class DashboardScreen extends StatefulWidget {
  final ApiClient api;
  const DashboardScreen({super.key, required this.api});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  Map<String, dynamic>? data;
  Future<void> load() async {
    data = await widget.api.getDashboard();
    setState((){});
  }

  @override
  void initState() { super.initState(); load(); }

  @override
  Widget build(BuildContext context) {
    final d = data;
    return Scaffold(
      appBar: AppBar(title: const Text('Dashboard')),
      body: d == null ? const Center(child: CircularProgressIndicator()) : Padding(
        padding: const EdgeInsets.all(16),
        child: Wrap(spacing: 16, runSpacing: 16, children: [
          _card('Vagas', d['jobs']?.toString() ?? '-'),
          _card('Candidatos', d['candidates']?.toString() ?? '-'),
          _card('Entrevistas', d['interviews']?.toString() ?? '-'),
        ]),
      ),
    );
  }

  Widget _card(String label, String value) {
    return SizedBox(
      width: 200,
      height: 120,
      child: Card(
        child: Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
          Text(value, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text(label),
        ])),
      ),
    );
  }
}


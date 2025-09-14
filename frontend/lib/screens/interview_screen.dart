import 'package:flutter/material.dart';
import '../services/api.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

class InterviewScreen extends StatefulWidget {
  final ApiClient api;
  final String interviewId;
  const InterviewScreen({super.key, required this.api, required this.interviewId});
  @override
  State<InterviewScreen> createState() => _InterviewScreenState();
}

class _InterviewScreenState extends State<InterviewScreen> {
  Map<String, dynamic>? interview;
  Future<void> load() async {
    interview = await widget.api.getInterview(widget.interviewId);
    setState((){});
  }

  @override
  void initState() { super.initState(); load(); }

  @override
  Widget build(BuildContext context) {
    final i = interview;
    return Scaffold(
      appBar: AppBar(title: const Text('Entrevista')),
      body: i == null ? const Center(child: CircularProgressIndicator()) : Padding(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Candidato: ${i['candidate']['name']}', style: const TextStyle(fontWeight: FontWeight.bold)),
          Text('Vaga: ${i['job']['title']}'),
          const SizedBox(height: 12),
          FilledButton(onPressed: _generate, child: const Text('Gerar Perguntas')),
          const SizedBox(height: 12),
          Expanded(child: ListView.builder(itemCount: i['questions']?.length ?? 0, itemBuilder: (_, idx) => ListTile(title: Text(i['questions'][idx]['text'])))),
        ]),
      ),
    );
  }

  Future<void> _generate() async {
    await widget.api.generateQuestions(widget.interviewId, count: 8);
    await load();
  }
}

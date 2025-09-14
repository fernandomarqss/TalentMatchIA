import 'dart:io';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import '../services/api.dart';

class ResumeUploadScreen extends StatefulWidget {
  final ApiClient api;
  final List<dynamic> jobs;
  const ResumeUploadScreen({super.key, required this.api, required this.jobs});

  @override
  State<ResumeUploadScreen> createState() => _ResumeUploadScreenState();
}

class _ResumeUploadScreenState extends State<ResumeUploadScreen> {
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _github = TextEditingController();
  String? _jobId;
  String? _filePath;
  bool _loading = false;
  Map<String, dynamic>? _result;

  Future<void> _pickFile() async {
    final res = await FilePicker.platform.pickFiles(type: FileType.custom, allowedExtensions: ['pdf', 'txt']);
    if (res != null && res.files.single.path != null) {
      setState(() => _filePath = res.files.single.path);
    }
  }

  Future<void> _upload() async {
    if (_filePath == null) return;
    setState(() { _loading = true; _result = null; });
    final uri = Uri.file(_filePath!);
    final filename = _filePath!.split(Platform.pathSeparator).last;
    final mimetype = filename.endsWith('.pdf')? 'application/pdf' : 'text/plain';
    final data = await widget.api.uploadResume(fileUri: uri, filename: filename, mimetype: mimetype, candidate: { 'name': _name.text, 'email': _email.text, 'github': _github.text }, jobId: _jobId);
    setState(() { _loading = false; _result = data; });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Upload de Currículo')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: SingleChildScrollView(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('Dados do Candidato', style: TextStyle(fontWeight: FontWeight.bold)),
            TextField(controller: _name, decoration: const InputDecoration(labelText: 'Nome')), 
            TextField(controller: _email, decoration: const InputDecoration(labelText: 'Email')), 
            TextField(controller: _github, decoration: const InputDecoration(labelText: 'GitHub (URL)')), 
            const SizedBox(height: 8),
            DropdownButtonFormField<String>(value: _jobId, hint: const Text('Selecione a vaga (opcional)'), items: widget.jobs.map((j)=> DropdownMenuItem<String>(value: j['id'], child: Text(j['title']))).toList(), onChanged: (v)=> setState(()=> _jobId = v)),
            const SizedBox(height: 16),
            Row(children: [
              FilledButton.icon(onPressed: _pickFile, icon: const Icon(Icons.upload_file), label: const Text('Escolher arquivo')),
              const SizedBox(width: 12),
              Text(_filePath ?? 'Nenhum arquivo selecionado'),
            ]),
            const SizedBox(height: 16),
            FilledButton(onPressed: (_filePath==null || _loading) ? null : _upload, child: _loading? const SizedBox(height:18,width:18,child: CircularProgressIndicator(strokeWidth:2)) : const Text('Enviar e Analisar')),
            const SizedBox(height: 16),
            if (_result != null) _ResultCard(result: _result!),
          ]),
        ),
      ),
    );
  }
}

class _ResultCard extends StatelessWidget {
  final Map<String, dynamic> result;
  const _ResultCard({required this.result});
  @override
  Widget build(BuildContext context) {
    final analysis = result['resume']?['analysisJson'] ?? {};
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('Análise', style: TextStyle(fontWeight: FontWeight.bold)),
          Text(analysis['summary'] ?? 'Sem resumo'),
          const SizedBox(height: 8),
          Wrap(spacing: 8, runSpacing: 8, children: (analysis['skills']??[]).map<Widget>((s)=> Chip(label: Text(s.toString()))).toList()),
        ]),
      ),
    );
  }
}


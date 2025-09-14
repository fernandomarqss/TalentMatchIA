import 'package:flutter/material.dart';
import '../services/api.dart';

class JobsScreen extends StatefulWidget {
  final ApiClient api;
  const JobsScreen({super.key, required this.api});
  @override
  State<JobsScreen> createState() => _JobsScreenState();
}

class _JobsScreenState extends State<JobsScreen> {
  List<dynamic>? jobs;
  Future<void> load() async { jobs = await widget.api.getJobs(); setState((){}); }
  @override
  void initState() { super.initState(); load(); }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Vagas')),
      floatingActionButton: FloatingActionButton(onPressed: () => _openForm(), child: const Icon(Icons.add)),
      body: jobs == null ? const Center(child: CircularProgressIndicator()) : ListView.separated(
        itemBuilder: (_, i) {
          final j = jobs![i];
          return ListTile(title: Text(j['title']), subtitle: Text(j['status']), onTap: () => _openForm(job: j));
        },
        separatorBuilder: (_, __) => const Divider(height: 1),
        itemCount: jobs!.length,
      ),
    );
  }

  Future<void> _openForm({Map<String, dynamic>? job}) async {
    final result = await showDialog<Map<String, dynamic>>(
      context: context,
      builder: (_) => _JobDialog(job: job),
    );
    if (result != null) {
      await widget.api.createJob(result);
      await load();
    }
  }
}

class _JobDialog extends StatefulWidget {
  final Map<String, dynamic>? job;
  const _JobDialog({required this.job});
  @override
  State<_JobDialog> createState() => _JobDialogState();
}

class _JobDialogState extends State<_JobDialog> {
  final _form = GlobalKey<FormState>();
  final _title = TextEditingController();
  final _desc = TextEditingController();
  final _req = TextEditingController();
  String _status = 'open';

  @override
  void initState() {
    super.initState();
    final j = widget.job;
    if (j != null) {
      _title.text = j['title'];
      _desc.text = j['description'];
      _req.text = j['requirements'];
      _status = j['status'];
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(widget.job == null ? 'Nova Vaga' : 'Editar Vaga'),
      content: Form(
        key: _form,
        child: SizedBox(width: 420, child: SingleChildScrollView(child: Column(children: [
          TextFormField(controller: _title, decoration: const InputDecoration(labelText: 'Título'), validator: (v)=> v!=null && v.isNotEmpty ? null : 'Obrigatório'),
          TextFormField(controller: _desc, decoration: const InputDecoration(labelText: 'Descrição'), maxLines: 4),
          TextFormField(controller: _req, decoration: const InputDecoration(labelText: 'Requisitos'), maxLines: 3),
          const SizedBox(height: 8),
          DropdownButtonFormField(value: _status, items: const [DropdownMenuItem(value: 'open', child: Text('Aberta')), DropdownMenuItem(value: 'closed', child: Text('Fechada'))], onChanged: (v){ setState(()=> _status = v!); }),
        ]))),
      ),
      actions: [
        TextButton(onPressed: ()=> Navigator.pop(context), child: const Text('Cancelar')),
        FilledButton(onPressed: (){
          if (_form.currentState!.validate()) {
            Navigator.pop(context, { 'title': _title.text, 'description': _desc.text, 'requirements': _req.text, 'status': _status });
          }
        }, child: const Text('Salvar')),
      ],
    );
  }
}


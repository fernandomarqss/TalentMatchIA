import 'package:flutter/material.dart';
import 'services/api.dart';
import 'theme.dart';
import 'screens/login_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/jobs_screen.dart';
import 'screens/resume_upload_screen.dart';

void main() {
  runApp(const TalentMatchIAApp());
}

class TalentMatchIAApp extends StatefulWidget {
  const TalentMatchIAApp({super.key});
  @override
  State<TalentMatchIAApp> createState() => _TalentMatchIAAppState();
}

class _TalentMatchIAAppState extends State<TalentMatchIAApp> {
  final ApiClient api = ApiClient(baseUrl: const String.fromEnvironment('API_BASE_URL', defaultValue: 'http://localhost:4000'));
  bool logged = false;
  List<dynamic> jobs = [];

  Future<void> _loadJobs() async { jobs = await api.getJobs(); setState((){}); }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'TalentMatchIA',
      theme: AppTheme.light(),
      home: logged ? _Home(api: api, onReloadJobs: _loadJobs, jobs: jobs) : LoginScreen(api: api, onLogged: () { setState(() => logged = true); _loadJobs(); }),
    );
  }
}

class _Home extends StatefulWidget {
  final ApiClient api; 
  final Future<void> Function() onReloadJobs; 
  final List<dynamic> jobs;
  const _Home({required this.api, required this.onReloadJobs, required this.jobs});
  @override
  State<_Home> createState() => _HomeState();
}

class _HomeState extends State<_Home> {
  int _index = 0;
  @override
  Widget build(BuildContext context) {
    final pages = [
      DashboardScreen(api: widget.api),
      JobsScreen(api: widget.api),
      ResumeUploadScreen(api: widget.api, jobs: widget.jobs),
    ];
    return Scaffold(
      body: pages[_index],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (i) async { setState(()=> _index = i); if (i==1) await widget.onReloadJobs(); },
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard_outlined), selectedIcon: Icon(Icons.dashboard), label: 'Dashboard'),
          NavigationDestination(icon: Icon(Icons.work_outline), selectedIcon: Icon(Icons.work), label: 'Vagas'),
          NavigationDestination(icon: Icon(Icons.upload_file_outlined), selectedIcon: Icon(Icons.upload_file), label: 'Currículos'),
        ],
      ),
    );
  }
}


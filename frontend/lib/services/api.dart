import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiClient {
  final String baseUrl;
  String? _token;
  ApiClient({required this.baseUrl});

  set token(String? t) => _token = t;

  Map<String, String> _headers({Map<String, String>? extra}) {
    return {
      'Content-Type': 'application/json',
      if (_token != null) 'Authorization': 'Bearer $_token',
      ...?extra,
    };
  }

  Future<Map<String, dynamic>> login(String email, String password) async {
    final resp = await http.post(Uri.parse('$baseUrl/auth/login'), headers: _headers(), body: jsonEncode({ 'email': email, 'password': password }));
    if (resp.statusCode >= 400) throw Exception(resp.body);
    final data = jsonDecode(resp.body);
    token = data['token'];
    return data;
  }

  Future<Map<String, dynamic>> register(String name, String email, String password, {bool acceptedLGPD = true}) async {
    final resp = await http.post(Uri.parse('$baseUrl/auth/register'), headers: _headers(), body: jsonEncode({ 'name': name, 'email': email, 'password': password, 'acceptedLGPD': acceptedLGPD }));
    if (resp.statusCode >= 400) throw Exception(resp.body);
    final data = jsonDecode(resp.body);
    token = data['token'];
    return data;
  }

  Future<Map<String, dynamic>> getDashboard() async {
    final resp = await http.get(Uri.parse('$baseUrl/dashboard'), headers: _headers());
    if (resp.statusCode >= 400) throw Exception(resp.body);
    return jsonDecode(resp.body);
  }

  Future<List<dynamic>> getJobs() async {
    final resp = await http.get(Uri.parse('$baseUrl/jobs'), headers: _headers());
    if (resp.statusCode >= 400) throw Exception(resp.body);
    return jsonDecode(resp.body);
  }

  Future<Map<String, dynamic>> createJob(Map<String, dynamic> job) async {
    final resp = await http.post(Uri.parse('$baseUrl/jobs'), headers: _headers(), body: jsonEncode(job));
    if (resp.statusCode >= 400) throw Exception(resp.body);
    return jsonDecode(resp.body);
  }

  Future<Map<String, dynamic>> uploadResume({required Uri fileUri, required String filename, required String mimetype, required Map<String, dynamic> candidate, String? jobId}) async {
    final req = http.MultipartRequest('POST', Uri.parse('$baseUrl/resumes/upload'));
    if (_token != null) req.headers['Authorization'] = 'Bearer $_token';
    req.files.add(await http.MultipartFile.fromPath('file', fileUri.toFilePath(), filename: filename, contentType: null));
    req.fields['candidate'] = jsonEncode(candidate);
    if (jobId != null) req.fields['jobId'] = jobId;
    final streamed = await req.send();
    final resp = await http.Response.fromStream(streamed);
    if (resp.statusCode >= 400) throw Exception(resp.body);
    return jsonDecode(resp.body);
  }

  Future<List<dynamic>> generateQuestions(String interviewId, {int count = 8}) async {
    final resp = await http.post(Uri.parse('$baseUrl/interviews/$interviewId/questions?count=$count'), headers: _headers());
    if (resp.statusCode >= 400) throw Exception(resp.body);
    return jsonDecode(resp.body);
  }

  Future<Map<String, dynamic>> getInterview(String interviewId) async {
    final resp = await http.get(Uri.parse('$baseUrl/interviews/$interviewId'), headers: _headers());
    if (resp.statusCode >= 400) throw Exception(resp.body);
    return jsonDecode(resp.body);
  }
}

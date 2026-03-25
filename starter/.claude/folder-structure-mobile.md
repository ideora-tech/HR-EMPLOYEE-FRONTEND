# Folder Structure — Flutter Mobile

Gunakan file ini sebagai acuan standar struktur folder project Flutter.
Claude wajib membandingkan kode yang direview dengan pola di sini dan
melaporkan deviasi sebagai temuan di modul Code Quality Review.

> **Arsitektur**: View → Controller/Notifier → Repository → Remote/Local DataSource
> Setiap feature wajib memiliki: `views/`, `controllers/` atau `providers/`, `repositories/`, `models/`, `bindings/` (GetX).
untuk setiap file tidak boleh lebih dari 1000 line


---

## Pilih Arsitektur Sesuai State Management

| | **GetX** | **Riverpod** |
|--|----------|--------------|
| State | `XxxController extends GetxController` | `XxxNotifier extends StateNotifier` |
| Inject | `Get.put()` / `Get.lazyPut()` via Binding | `ref.watch()` / `ref.read()` via Provider |
| Route | `GetMaterialApp` + `app_pages.dart` | `MaterialApp` + `GoRouter` |
| DI | `Bindings` per route | Provider override |

---

## Struktur Folder — GetX

```
{project-name}/
├── lib/
│   ├── main.dart                              ← Entry point, setup flavor & DI global
│   ├── app.dart                               ← GetMaterialApp, theme, locale
│   │
│   ├── core/                                  ← Shared infrastructure (tidak feature-specific)
│   │   ├── constants/
│   │   │   ├── app_colors.dart                ← Semua warna dari design system
│   │   │   ├── app_text_styles.dart           ← TextStyle standar
│   │   │   ├── app_spacing.dart               ← Spacing/padding standar
│   │   │   └── app_strings.dart               ← String konstan (bukan teks UI)
│   │   ├── config/
│   │   │   ├── app_config.dart                ← Base URL, env config
│   │   │   └── flavor_config.dart             ← dev / staging / production config
│   │   ├── di/
│   │   │   └── initial_binding.dart           ← Binding global (Dio, StorageService, dll)
│   │   ├── network/
│   │   │   ├── dio_client.dart                ← Singleton Dio + interceptor
│   │   │   ├── auth_interceptor.dart          ← Auto-attach token, refresh 401
│   │   │   └── api_response.dart              ← Wrapper response: { success, message, data }
│   │   ├── storage/
│   │   │   ├── secure_storage.dart            ← flutter_secure_storage (token JWT)
│   │   │   └── local_storage.dart             ← get_storage / shared_preferences
│   │   ├── error/
│   │   │   ├── app_exception.dart             ← Custom exception class
│   │   │   └── error_handler.dart             ← Parse DioException → pesan user-friendly
│   │   ├── utils/
│   │   │   ├── date_util.dart                 ← Format tanggal
│   │   │   ├── currency_util.dart             ← Format Rupiah
│   │   │   ├── validator_util.dart            ← Validasi email, phone, dll
│   │   │   └── file_util.dart                 ← Download/open file helper
│   │   └── widgets/                           ← Widget reusable global
│   │       ├── app_button.dart                ← Tombol standar dengan loading state
│   │       ├── app_text_field.dart            ← TextField dengan styling standar
│   │       ├── app_loading.dart               ← Loading indicator
│   │       ├── app_error_widget.dart          ← Error state dengan retry button
│   │       ├── app_empty_widget.dart          ← Empty state
│   │       └── app_snackbar.dart              ← Snackbar/toast standar
│   │
│   ├── routes/                                ← Semua konfigurasi navigasi
│   │   ├── app_pages.dart                     ← Daftar semua route + binding
│   │   └── app_routes.dart                    ← Konstanta nama route ('/login', '/home')
│   │
│   ├── models/                                ← Model yang dipakai lintas feature
│   │   ├── pagination_model.dart              ← PaginatedResult<T>, PaginationMeta
│   │   └── user_model.dart                    ← UserModel (dari response auth)
│   │
│   └── features/                             ← Semua feature module
│       │
│       ├── auth/                              ── FEATURE: Authentication
│       │   ├── bindings/
│       │   │   └── auth_binding.dart          ← Register LoginController, RegisterController
│       │   ├── controllers/
│       │   │   ├── login_controller.dart      ← State & logic login
│       │   │   └── register_controller.dart   ← State & logic register
│       │   ├── models/
│       │   │   ├── login_request_model.dart   ← { email, password } untuk request
│       │   │   └── auth_response_model.dart   ← { user, tokens } dari response
│       │   ├── repositories/
│       │   │   └── auth_repository.dart       ← Panggil API auth via Dio
│       │   └── views/
│       │       ├── login_view.dart            ← Halaman login
│       │       ├── register_view.dart         ← Halaman register
│       │       └── widgets/                   ← Widget khusus feature auth
│       │           └── social_login_button.dart
│       │
│       ├── dashboard/                         ── FEATURE: Dashboard / Home
│       │   ├── bindings/
│       │   │   └── dashboard_binding.dart
│       │   ├── controllers/
│       │   │   └── dashboard_controller.dart
│       │   ├── models/
│       │   │   └── dashboard_summary_model.dart
│       │   ├── repositories/
│       │   │   └── dashboard_repository.dart
│       │   └── views/
│       │       ├── dashboard_view.dart
│       │       └── widgets/
│       │           ├── summary_card_widget.dart
│       │           └── chart_widget.dart
│       │
│       ├── users/                             ── FEATURE: User Management
│       │   ├── bindings/
│       │   │   └── users_binding.dart
│       │   ├── controllers/
│       │   │   ├── users_controller.dart      ← List, pagination, search
│       │   │   └── user_form_controller.dart  ← Create / Edit user
│       │   ├── models/
│       │   │   ├── user_model.dart            ← Shape dari IUserPublic backend
│       │   │   └── user_form_model.dart       ← Form input
│       │   ├── repositories/
│       │   │   └── users_repository.dart      ← GET /users, POST, PUT, DELETE
│       │   └── views/
│       │       ├── users_list_view.dart
│       │       ├── user_detail_view.dart
│       │       ├── user_form_view.dart
│       │       └── widgets/
│       │           └── user_card_widget.dart
│       │
│       ├── export/                            ── FEATURE: Export Excel & PDF
│       │   ├── bindings/
│       │   │   └── export_binding.dart
│       │   ├── controllers/
│       │   │   └── export_controller.dart     ← Handle download progress & state
│       │   ├── repositories/
│       │   │   └── export_repository.dart     ← Panggil endpoint /export/excel, /export/pdf
│       │   └── views/
│       │       └── export_view.dart           ← Form filter + tombol download
│       │
│       └── [feature]/                         ── Template feature baru
│           ├── bindings/
│           │   └── [feature]_binding.dart
│           ├── controllers/
│           │   └── [feature]_controller.dart
│           ├── models/
│           │   └── [feature]_model.dart
│           ├── repositories/
│           │   └── [feature]_repository.dart
│           └── views/
│               ├── [feature]_view.dart
│               └── widgets/
│
├── test/
│   ├── unit/
│   │   ├── controllers/
│   │   └── repositories/
│   └── widget/
│       └── features/
│
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── .env.dev
├── .env.staging
├── .env.prod
├── pubspec.yaml
└── README.md
```

---

## Struktur Folder — Riverpod

```
{project-name}/
├── lib/
│   ├── main.dart                              ← Entry point, ProviderScope di root
│   ├── app.dart                               ← MaterialApp + GoRouter setup
│   │
│   ├── core/                                  ← Sama seperti GetX (lihat di atas)
│   │   ├── constants/
│   │   ├── config/
│   │   ├── network/
│   │   │   ├── dio_client.dart                ← Provider: dioClientProvider
│   │   │   └── auth_interceptor.dart
│   │   ├── storage/
│   │   ├── error/
│   │   ├── utils/
│   │   └── widgets/
│   │
│   ├── routes/
│   │   └── app_router.dart                    ← GoRouter config, redirect logic
│   │
│   └── features/
│       │
│       ├── auth/                              ── FEATURE: Authentication
│       │   ├── data/
│       │   │   ├── auth_repository.dart       ← implements IAuthRepository
│       │   │   └── auth_remote_datasource.dart← Panggil API via Dio
│       │   ├── domain/
│       │   │   └── auth_repository_interface.dart ← abstract class IAuthRepository
│       │   ├── models/
│       │   │   ├── login_request_model.dart
│       │   │   └── auth_response_model.dart
│       │   ├── providers/
│       │   │   ├── auth_provider.dart         ← authProvider (StateNotifierProvider)
│       │   │   └── auth_repository_provider.dart ← authRepositoryProvider
│       │   └── views/
│       │       ├── login_view.dart
│       │       └── widgets/
│       │
│       ├── users/                             ── FEATURE: User Management
│       │   ├── data/
│       │   │   ├── users_repository.dart
│       │   │   └── users_remote_datasource.dart
│       │   ├── domain/
│       │   │   └── users_repository_interface.dart
│       │   ├── models/
│       │   │   └── user_model.dart
│       │   ├── providers/
│       │   │   ├── users_provider.dart        ← usersProvider (list + pagination)
│       │   │   └── users_repository_provider.dart
│       │   └── views/
│       │       ├── users_list_view.dart
│       │       └── widgets/
│       │
│       └── [feature]/
│           ├── data/
│           ├── domain/
│           ├── models/
│           ├── providers/
│           └── views/
│
├── test/
├── assets/
└── pubspec.yaml
```

---

## Detail File Penting

### `lib/main.dart`
```dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';                    // GetX
// import 'package:flutter_riverpod/flutter_riverpod.dart'; // Riverpod
import 'core/config/app_config.dart';
import 'core/di/initial_binding.dart';
import 'app.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Load env config
  await AppConfig.initialize(Flavor.development);

  runApp(
    // GetX:
    const MyApp(),

    // Riverpod:
    // const ProviderScope(child: MyApp()),
  );
}
```

---

### `lib/app.dart` (GetX)
```dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'core/di/initial_binding.dart';
import 'routes/app_pages.dart';
import 'routes/app_routes.dart';

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      title: 'App Name',
      debugShowCheckedModeBanner: false,
      initialBinding: InitialBinding(),    // DI global
      initialRoute: AppRoutes.splash,
      getPages: AppPages.routes,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF2E75B6)),
        useMaterial3: true,
      ),
    );
  }
}
```

---

### `lib/routes/app_routes.dart`
```dart
abstract class AppRoutes {
  static const splash    = '/splash';
  static const login     = '/login';
  static const register  = '/register';
  static const dashboard = '/dashboard';
  static const users     = '/users';
  static const userDetail = '/users/detail';
  static const userForm  = '/users/form';
  static const export    = '/export';
}
```

---

### `lib/routes/app_pages.dart`
```dart
import 'package:get/get.dart';
import '../features/auth/bindings/auth_binding.dart';
import '../features/auth/views/login_view.dart';
import '../features/dashboard/bindings/dashboard_binding.dart';
import '../features/dashboard/views/dashboard_view.dart';
import '../features/users/bindings/users_binding.dart';
import '../features/users/views/users_list_view.dart';
import '../features/export/bindings/export_binding.dart';
import '../features/export/views/export_view.dart';
import 'app_routes.dart';

class AppPages {
  static final routes = [
    GetPage(
      name: AppRoutes.login,
      page: () => const LoginView(),
      binding: AuthBinding(),
    ),
    GetPage(
      name: AppRoutes.dashboard,
      page: () => const DashboardView(),
      binding: DashboardBinding(),
    ),
    GetPage(
      name: AppRoutes.users,
      page: () => const UsersListView(),
      binding: UsersBinding(),
    ),
    GetPage(
      name: AppRoutes.export,
      page: () => const ExportView(),
      binding: ExportBinding(),
    ),
  ];
}
```

---

### `lib/core/network/dio_client.dart`
```dart
import 'package:dio/dio.dart';
import 'package:get/get.dart' show Get;
import '../config/app_config.dart';
import '../storage/secure_storage.dart';
import 'auth_interceptor.dart';

class DioClient {
  static Dio? _instance;

  static Dio get instance {
    _instance ??= _createDio();
    return _instance!;
  }

  static Dio _createDio() {
    final dio = Dio(BaseOptions(
      baseUrl: AppConfig.baseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    dio.interceptors.addAll([
      AuthInterceptor(dio, SecureStorage()),
      LogInterceptor(requestBody: true, responseBody: true), // hapus di production
    ]);

    return dio;
  }
}
```

---

### `lib/core/network/auth_interceptor.dart`
```dart
import 'package:dio/dio.dart';
import '../storage/secure_storage.dart';

class AuthInterceptor extends Interceptor {
  final Dio _dio;
  final SecureStorage _storage;
  bool _isRefreshing = false;

  AuthInterceptor(this._dio, this._storage);

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    final token = await _storage.getAccessToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401 && !_isRefreshing) {
      _isRefreshing = true;
      try {
        final refreshed = await _tryRefreshToken();
        if (refreshed) {
          // Retry request original dengan token baru
          final token = await _storage.getAccessToken();
          err.requestOptions.headers['Authorization'] = 'Bearer $token';
          final response = await _dio.fetch(err.requestOptions);
          handler.resolve(response);
          return;
        }
      } catch (_) {
        await _storage.clearTokens();
        // Navigate ke login
      } finally {
        _isRefreshing = false;
      }
    }
    handler.next(err);
  }

  Future<bool> _tryRefreshToken() async {
    final refreshToken = await _storage.getRefreshToken();
    if (refreshToken == null) return false;

    final response = await _dio.post('/api/v1/auth/refresh', data: {
      'refreshToken': refreshToken,
    });
    final tokens = response.data['data']['tokens'];
    await _storage.saveTokens(
      accessToken: tokens['accessToken'],
      refreshToken: tokens['refreshToken'],
    );
    return true;
  }
}
```

---

### `lib/core/network/api_response.dart`
```dart
// Sesuai format StandardResponse dari NestJS backend
class ApiResponse<T> {
  final bool success;
  final String message;
  final T? data;

  const ApiResponse({
    required this.success,
    required this.message,
    this.data,
  });

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic)? fromJsonT,
  ) {
    return ApiResponse<T>(
      success: json['success'] as bool,
      message: json['message'] as String,
      data: json['data'] != null && fromJsonT != null
          ? fromJsonT(json['data'])
          : null,
    );
  }
}
```

---

### `lib/models/pagination_model.dart`
```dart
// Sesuai PaginatedResult<T> dari NestJS backend
class PaginatedResult<T> {
  final List<T> data;
  final PaginationMeta meta;

  const PaginatedResult({required this.data, required this.meta});

  factory PaginatedResult.fromJson(
    Map<String, dynamic> json,
    T Function(Map<String, dynamic>) fromJsonT,
  ) {
    return PaginatedResult<T>(
      data: (json['data'] as List)
          .map((e) => fromJsonT(e as Map<String, dynamic>))
          .toList(),
      meta: PaginationMeta.fromJson(json['meta'] as Map<String, dynamic>),
    );
  }
}

class PaginationMeta {
  final int page;
  final int limit;
  final int total;
  final int totalPages;

  const PaginationMeta({
    required this.page,
    required this.limit,
    required this.total,
    required this.totalPages,
  });

  factory PaginationMeta.fromJson(Map<String, dynamic> json) {
    return PaginationMeta(
      page:       json['page'] as int,
      limit:      json['limit'] as int,
      total:      json['total'] as int,
      totalPages: json['totalPages'] as int,
    );
  }

  bool get hasNextPage => page < totalPages;
}
```

---

### `lib/features/auth/models/auth_response_model.dart`
```dart
class AuthResponseModel {
  final UserModel user;
  final AuthTokensModel tokens;

  const AuthResponseModel({required this.user, required this.tokens});

  factory AuthResponseModel.fromJson(Map<String, dynamic> json) {
    return AuthResponseModel(
      user:   UserModel.fromJson(json['user'] as Map<String, dynamic>),
      tokens: AuthTokensModel.fromJson(json['tokens'] as Map<String, dynamic>),
    );
  }
}

class AuthTokensModel {
  final String accessToken;
  final String refreshToken;

  const AuthTokensModel({required this.accessToken, required this.refreshToken});

  factory AuthTokensModel.fromJson(Map<String, dynamic> json) {
    return AuthTokensModel(
      accessToken:  json['accessToken'] as String,
      refreshToken: json['refreshToken'] as String,
    );
  }
}

class UserModel {
  final int id;
  final String name;
  final String email;
  final String role;
  final bool isActive;
  final DateTime createdAt;

  const UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    required this.isActive,
    required this.createdAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id:        json['id'] as int,
      name:      json['name'] as String,
      email:     json['email'] as String,
      role:      json['role'] as String,
      isActive:  json['is_active'] == 1 || json['is_active'] == true,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }
}
```

---

### `lib/features/auth/repositories/auth_repository.dart`
```dart
import 'package:dio/dio.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/error/error_handler.dart';
import '../../../core/storage/secure_storage.dart';
import '../models/auth_response_model.dart';

class AuthRepository {
  final Dio _dio = DioClient.instance;
  final SecureStorage _storage = SecureStorage();

  Future<AuthResponseModel> login(String email, String password) async {
    try {
      final response = await _dio.post('/api/v1/auth/login', data: {
        'email': email,
        'password': password,
      });

      final authData = AuthResponseModel.fromJson(
        response.data['data'] as Map<String, dynamic>,
      );

      // Simpan token ke secure storage
      await _storage.saveTokens(
        accessToken:  authData.tokens.accessToken,
        refreshToken: authData.tokens.refreshToken,
      );

      return authData;
    } on DioException catch (e) {
      throw ErrorHandler.handle(e);
    }
  }

  Future<void> logout() async {
    try {
      await _dio.post('/api/v1/auth/logout');
    } finally {
      await _storage.clearTokens();
    }
  }
}
```

---

### `lib/features/auth/controllers/login_controller.dart` (GetX)
```dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../repositories/auth_repository.dart';
import '../../../core/error/app_exception.dart';
import '../../../routes/app_routes.dart';

class LoginController extends GetxController {
  final AuthRepository _authRepo;

  LoginController(this._authRepo);

  // Form
  final emailCtrl    = TextEditingController();
  final passwordCtrl = TextEditingController();
  final formKey      = GlobalKey<FormState>();

  // State
  final isLoading     = false.obs;
  final errorMessage  = ''.obs;
  final obscurePassword = true.obs;

  @override
  void onClose() {
    emailCtrl.dispose();
    passwordCtrl.dispose();
    super.onClose();
  }

  void togglePassword() => obscurePassword.toggle();

  Future<void> login() async {
    if (!formKey.currentState!.validate()) return;

    isLoading.value = true;
    errorMessage.value = '';

    try {
      await _authRepo.login(
        emailCtrl.text.trim(),
        passwordCtrl.text,
      );
      Get.offAllNamed(AppRoutes.dashboard);
    } on AppException catch (e) {
      errorMessage.value = e.message;
    } finally {
      isLoading.value = false;
    }
  }
}
```

---

### `lib/features/auth/bindings/auth_binding.dart`
```dart
import 'package:get/get.dart';
import '../controllers/login_controller.dart';
import '../repositories/auth_repository.dart';

class AuthBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<AuthRepository>(() => AuthRepository());
    Get.lazyPut<LoginController>(
      () => LoginController(Get.find<AuthRepository>()),
    );
  }
}
```

---

### `lib/features/users/repositories/users_repository.dart`
```dart
import 'package:dio/dio.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/error/error_handler.dart';
import '../../../models/pagination_model.dart';
import '../models/user_model.dart';

class UsersRepository {
  final Dio _dio = DioClient.instance;

  Future<PaginatedResult<UserModel>> getUsers({int page = 1, int limit = 20}) async {
    try {
      final response = await _dio.get('/api/v1/users', queryParameters: {
        'page': page,
        'limit': limit,
      });

      return PaginatedResult.fromJson(
        response.data['data'] as Map<String, dynamic>,
        UserModel.fromJson,
      );
    } on DioException catch (e) {
      throw ErrorHandler.handle(e);
    }
  }

  Future<UserModel> getUserById(int id) async {
    try {
      final response = await _dio.get('/api/v1/users/$id');
      return UserModel.fromJson(response.data['data'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ErrorHandler.handle(e);
    }
  }

  Future<UserModel> createUser(Map<String, dynamic> data) async {
    try {
      final response = await _dio.post('/api/v1/users', data: data);
      return UserModel.fromJson(response.data['data'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ErrorHandler.handle(e);
    }
  }

  Future<UserModel> updateUser(int id, Map<String, dynamic> data) async {
    try {
      final response = await _dio.put('/api/v1/users/$id', data: data);
      return UserModel.fromJson(response.data['data'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ErrorHandler.handle(e);
    }
  }

  Future<void> deleteUser(int id) async {
    try {
      await _dio.delete('/api/v1/users/$id');
    } on DioException catch (e) {
      throw ErrorHandler.handle(e);
    }
  }
}
```

---

### `lib/features/users/controllers/users_controller.dart` (GetX)
```dart
import 'package:get/get.dart';
import '../repositories/users_repository.dart';
import '../models/user_model.dart';
import '../../../models/pagination_model.dart';
import '../../../core/error/app_exception.dart';
import '../../../core/widgets/app_snackbar.dart';

class UsersController extends GetxController {
  final UsersRepository _repo;

  UsersController(this._repo);

  // State
  final users       = <UserModel>[].obs;
  final isLoading   = false.obs;
  final isLoadingMore = false.obs;
  final errorMsg    = ''.obs;
  final searchQuery = ''.obs;

  // Pagination
  int _currentPage = 1;
  bool _hasMore = true;
  final _limit = 20;

  @override
  void onInit() {
    super.onInit();
    loadUsers();
    // Debounce search
    debounce(searchQuery, (_) => refreshUsers(), time: 500.milliseconds);
  }

  Future<void> loadUsers({bool refresh = false}) async {
    if (refresh) {
      _currentPage = 1;
      _hasMore = true;
      users.clear();
    }

    if (!_hasMore) return;

    _currentPage == 1
        ? isLoading.value = true
        : isLoadingMore.value = true;
    errorMsg.value = '';

    try {
      final result = await _repo.getUsers(page: _currentPage, limit: _limit);
      users.addAll(result.data);
      _hasMore = result.meta.hasNextPage;
      _currentPage++;
    } on AppException catch (e) {
      errorMsg.value = e.message;
    } finally {
      isLoading.value = false;
      isLoadingMore.value = false;
    }
  }

  Future<void> refreshUsers() => loadUsers(refresh: true);

  Future<void> deleteUser(int id) async {
    try {
      await _repo.deleteUser(id);
      users.removeWhere((u) => u.id == id);
      AppSnackbar.success('User berhasil dihapus');
    } on AppException catch (e) {
      AppSnackbar.error(e.message);
    }
  }
}
```

---

### `lib/features/export/repositories/export_repository.dart`
```dart
import 'package:dio/dio.dart';
import 'package:open_file/open_file.dart';
import 'package:path_provider/path_provider.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/error/error_handler.dart';

class ExportRepository {
  final Dio _dio = DioClient.instance;

  Future<void> downloadExcel({
    required String dateFrom,
    required String dateTo,
    void Function(double progress)? onProgress,
  }) async {
    final dir = await getApplicationDocumentsDirectory();
    final filePath = '${dir.path}/laporan-${DateTime.now().millisecondsSinceEpoch}.xlsx';

    try {
      await _dio.download(
        '/api/v1/export/users/excel',
        filePath,
        queryParameters: { 'dateFrom': dateFrom, 'dateTo': dateTo },
        onReceiveProgress: (received, total) {
          if (total > 0) onProgress?.call(received / total);
        },
        options: Options(responseType: ResponseType.bytes),
      );
      await OpenFile.open(filePath);
    } on DioException catch (e) {
      throw ErrorHandler.handle(e);
    }
  }

  Future<void> downloadPdf({
    required String dateFrom,
    required String dateTo,
    void Function(double progress)? onProgress,
  }) async {
    final dir = await getApplicationDocumentsDirectory();
    final filePath = '${dir.path}/laporan-${DateTime.now().millisecondsSinceEpoch}.pdf';

    try {
      await _dio.download(
        '/api/v1/export/users/pdf',
        filePath,
        queryParameters: { 'dateFrom': dateFrom, 'dateTo': dateTo },
        onReceiveProgress: (received, total) {
          if (total > 0) onProgress?.call(received / total);
        },
        options: Options(responseType: ResponseType.bytes),
      );
      await OpenFile.open(filePath);
    } on DioException catch (e) {
      throw ErrorHandler.handle(e);
    }
  }
}
```

---

### `lib/features/export/controllers/export_controller.dart`
```dart
import 'package:get/get.dart';
import '../repositories/export_repository.dart';
import '../../../core/error/app_exception.dart';
import '../../../core/widgets/app_snackbar.dart';

class ExportController extends GetxController {
  final ExportRepository _repo;

  ExportController(this._repo);

  final isDownloadingExcel = false.obs;
  final isDownloadingPdf   = false.obs;
  final downloadProgress   = 0.0.obs;
  final dateFrom = ''.obs;
  final dateTo   = ''.obs;

  Future<void> exportExcel() async {
    isDownloadingExcel.value = true;
    downloadProgress.value = 0;

    try {
      await _repo.downloadExcel(
        dateFrom: dateFrom.value,
        dateTo: dateTo.value,
        onProgress: (p) => downloadProgress.value = p,
      );
      AppSnackbar.success('File Excel berhasil didownload');
    } on AppException catch (e) {
      AppSnackbar.error(e.message);
    } finally {
      isDownloadingExcel.value = false;
    }
  }

  Future<void> exportPdf() async {
    isDownloadingPdf.value = true;
    downloadProgress.value = 0;

    try {
      await _repo.downloadPdf(
        dateFrom: dateFrom.value,
        dateTo: dateTo.value,
        onProgress: (p) => downloadProgress.value = p,
      );
      AppSnackbar.success('File PDF berhasil didownload');
    } on AppException catch (e) {
      AppSnackbar.error(e.message);
    } finally {
      isDownloadingPdf.value = false;
    }
  }
}
```

---

### `pubspec.yaml` (dependencies penting)
```yaml
dependencies:
  flutter:
    sdk: flutter

  # State management
  get: ^4.6.6                   # GetX (atau flutter_riverpod: ^2.4.0)

  # Network
  dio: ^5.4.0

  # Storage
  flutter_secure_storage: ^9.0.0
  get_storage: ^2.1.1            # atau shared_preferences

  # File & Export
  path_provider: ^2.1.2
  open_file: ^3.3.2
  permission_handler: ^11.3.0

  # UI Utilities
  cached_network_image: ^3.3.1

dev_dependencies:
  flutter_test:
    sdk: flutter
  mockito: ^5.4.4
  build_runner: ^2.4.8
```

---

## Tanggung Jawab Setiap Layer (GetX)

| Layer | File | Tanggung Jawab |
|-------|------|----------------|
| **View** | `*_view.dart` | Tampilkan UI, listen Rx state via `Obx()`, panggil method controller |
| **Widget** | `widgets/*.dart` | UI component yang bisa dipakai ulang dalam satu feature |
| **Controller** | `*_controller.dart` | State management, validasi form, orkestrasi, panggil repository |
| **Repository** | `*_repository.dart` | Panggil API via Dio, parse response ke model, throw AppException |
| **Model** | `*_model.dart` | Data class + `fromJson()`, tidak ada logic bisnis |
| **Binding** | `*_binding.dart` | Register controller & repository ke DI saat route dibuka |

---

## Aturan Review Folder Structure Flutter

| Deviasi | Severity | Saran |
|---------|----------|-------|
| Logic bisnis di View (bukan controller) | HIGH | Pindahkan ke controller |
| API call langsung di Controller (bukan repository) | HIGH | Buat repository layer |
| `Dio` diinstansiasi baru di tiap repository | HIGH | Pakai `DioClient.instance` singleton |
| Token disimpan di `SharedPreferences` bukan `flutter_secure_storage` | HIGH | Migrasi ke secure storage |
| `Get.find<X>()` tanpa Binding — controller tidak terdaftar | HIGH | Pakai Binding di `AppPages` |
| `Obx()` membungkus seluruh `Scaffold` / halaman | MEDIUM | Pindah Obx ke widget spesifik yang reaktif |
| TextEditingController tidak di-dispose di `onClose()` | MEDIUM | Dispose di `onClose()` |
| Route string hardcode di View (`Get.toNamed('/login')`) | MEDIUM | Pakai konstanta `AppRoutes.login` |
| Model tidak punya `fromJson()` — parse manual di controller | MEDIUM | Buat `factory fromJson()` di model |
| Error DioException tidak di-handle — crash langsung | MEDIUM | Tangkap dan konversi via `ErrorHandler` |
| `is_active` dari MySQL (int 0/1) di-cast langsung ke `bool` | MEDIUM | Pakai `json['is_active'] == 1 \|\| json['is_active'] == true` |
| Tidak ada pagination — load semua data sekaligus | MEDIUM | Implementasi pagination dengan `page` & `limit` |
| Tidak ada loading state saat request API | LOW | Tambah `isLoading.obs` di controller |
| File di root `lib/` tanpa subfolder | HIGH | Ikuti struktur `core/` + `features/` |
| Tidak ada `core/widgets/` — widget utility tersebar | LOW | Konsolidasikan ke `core/widgets/` |

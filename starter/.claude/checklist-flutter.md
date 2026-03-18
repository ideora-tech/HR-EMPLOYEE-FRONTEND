# Checklist Review — Dart / Flutter

## Code Quality

### Dart Specific
- [ ] `const` constructor dipakai untuk widget yang tidak berubah
- [ ] `final` dipakai untuk variabel yang tidak di-reassign
- [ ] Nullable types dihandle dengan `?` dan `!` dengan benar
- [ ] `late` keyword hanya dipakai jika benar-benar diinisialisasi sebelum akses
- [ ] Extension method dipakai untuk utility yang bersih
- [ ] Named parameter dipakai untuk fungsi dengan banyak parameter

### Flutter Widget
- [ ] `StatelessWidget` dipakai jika tidak ada state internal
- [ ] `const` dipakai di depan widget yang tidak perlu rebuild
- [ ] `Key` dipakai untuk list item yang bisa berubah urutan
- [ ] `BuildContext` tidak dipakai setelah `await` tanpa cek `mounted`
- [ ] Widget tree tidak terlalu dalam (lebih dari 5 level → extract ke widget baru)
- [ ] `ListView.builder` dipakai untuk list panjang (bukan `ListView` + `children`)

### State Management (Riverpod)
- [ ] Provider scope tepat (tidak global jika hanya butuh lokal)
- [ ] `ref.watch` di build(), `ref.read` di callback/event handler
- [ ] State tidak dimutasi langsung — selalu lewat notifier
- [ ] Provider di-dispose jika tidak dipakai (autoDispose)

### State Management (GetX)
- [ ] Controller di-inject dengan `Get.put()` atau `Get.lazyPut()`, bukan dibuat manual di widget
- [ ] `Get.find<Controller>()` hanya dipanggil setelah controller di-register
- [ ] `GetxController` di-extend, bukan `GetController` (deprecated)
- [ ] `onClose()` di-override untuk dispose resource (stream, timer, controller)
- [ ] `Obx()` hanya membungkus widget yang benar-benar reaktif — tidak wrap seluruh halaman
- [ ] `.obs` hanya dipakai untuk variabel yang perlu reaktif, bukan semua variabel
- [ ] `RxList`/`RxMap` dipakai untuk collection reaktif, bukan `List.obs`
- [ ] Navigasi pakai `Get.to()`, `Get.off()`, `Get.offAll()` dengan konsisten
- [ ] Named route didefinisikan di satu file terpusat (misal `app_pages.dart`)
- [ ] Binding dipakai untuk inject controller saat route dipanggil
- [ ] `GetBuilder` dipakai jika tidak butuh reaktivitas penuh (lebih ringan dari `Obx`)
- [ ] Worker (`ever`, `once`, `debounce`, `interval`) di-cancel di `onClose()`

### Performance
- [ ] `Image.network` pakai `cacheWidth`/`cacheHeight` untuk optimasi memori
- [ ] `FutureBuilder`/`StreamBuilder` tidak membuat future baru setiap build
- [ ] `MediaQuery.of(context)` tidak dipakai di widget yang sering rebuild
- [ ] Animasi menggunakan `AnimationController` yang di-dispose

---

## Bug Patterns yang Sering di Flutter

### setState setelah unmount
```dart
// ❌ Bug: crash jika widget sudah di-dispose
Future<void> loadData() async {
  final data = await api.fetchData();
  setState(() { _data = data; }); // crash jika sudah pindah halaman
}

// ✅ Fix
Future<void> loadData() async {
  final data = await api.fetchData();
  if (mounted) setState(() { _data = data; });
}
```

### BuildContext across async gap
```dart
// ❌ Bug: context mungkin sudah tidak valid
Future<void> handleSubmit() async {
  await saveData();
  Navigator.of(context).pop(); // ⚠️ context mungkin stale

// ✅ Fix
Future<void> handleSubmit() async {
  await saveData();
  if (!mounted) return;
  Navigator.of(context).pop();
}
```

### Nullable dereference
```dart
// ❌ Bug: crash jika user null
Text(user!.name) // force unwrap berbahaya

// ✅ Fix
Text(user?.name ?? 'Unknown')
```

### GetX — Controller tidak ditemukan
```dart
// ❌ Bug: Get.find() sebelum controller di-register → crash
class HomeView extends StatelessWidget {
  final controller = Get.find<HomeController>(); // error jika belum di-put

// ✅ Fix: pakai Binding atau pastikan sudah di-register
class HomeBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<HomeController>(() => HomeController());
  }
}
```

### GetX — Memory Leak Worker
```dart
// ❌ Bug: worker tidak di-cancel → memory leak
class UserController extends GetxController {
  final name = ''.obs;
  
  @override
  void onInit() {
    ever(name, (_) => print('name changed')); // tidak di-cancel!
  }
}

// ✅ Fix: simpan worker dan cancel di onClose
class UserController extends GetxController {
  final name = ''.obs;
  late Worker _nameWorker;

  @override
  void onInit() {
    _nameWorker = ever(name, (_) => print('name changed'));
  }

  @override
  void onClose() {
    _nameWorker.dispose();
    super.onClose();
  }
}
```

### GetX — Reactive rebuild berlebihan
```dart
// ❌ Bug: Obx membungkus seluruh page → rebuild semua widget
Obx(() => Scaffold(
  appBar: AppBar(title: Text(controller.title.value)),
  body: ExpensiveWidget(), // rebuild terus meski tidak perlu
))

// ✅ Fix: Obx hanya di bagian yang reaktif
Scaffold(
  appBar: AppBar(
    title: Obx(() => Text(controller.title.value)), // hanya title yang rebuild
  ),
  body: const ExpensiveWidget(),
)
```

### FutureBuilder anti-pattern
```dart
// ❌ Bug: future dibuat ulang setiap build → infinite loading
FutureBuilder(
  future: api.getUsers(), // dipanggil setiap rebuild!
  ...
)

// ✅ Fix: simpan future di initState
late Future<List<User>> _usersFuture;

@override
void initState() {
  super.initState();
  _usersFuture = api.getUsers();
}

// Lalu pakai _usersFuture di FutureBuilder
```

---

## Test Patterns — GetX (flutter_test)

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:get/get.dart';
import 'package:mockito/mockito.dart';

class MockAuthRepository extends Mock implements AuthRepository {}

void main() {
  late AuthController controller;
  late MockAuthRepository mockRepo;

  setUp(() {
    Get.testMode = true; // aktifkan test mode GetX
    mockRepo = MockAuthRepository();
    controller = AuthController(authRepo: mockRepo);
    Get.put(controller);
  });

  tearDown(() => Get.reset()); // bersihkan semua controller setelah test

  group('AuthController', () {
    test('login berhasil → isLoading false, user terisi', () async {
      when(mockRepo.login(any, any)).thenAnswer((_) async => fakeUser);

      await controller.login('test@test.com', 'pass123');

      expect(controller.isLoading.value, false);
      expect(controller.currentUser.value, fakeUser);
      expect(controller.errorMessage.value, '');
    });

    test('login gagal → errorMessage terisi', () async {
      when(mockRepo.login(any, any)).thenThrow(Exception('Invalid credentials'));

      await controller.login('wrong@test.com', 'wrong');

      expect(controller.isLoading.value, false);
      expect(controller.errorMessage.value, isNotEmpty);
      expect(controller.currentUser.value, isNull);
    });

    test('logout → currentUser null dan navigasi ke login', () async {
      controller.currentUser.value = fakeUser;

      controller.logout();

      expect(controller.currentUser.value, isNull);
      expect(Get.currentRoute, '/login');
    });
  });

  // Widget test dengan GetX
  group('LoginView dengan GetX', () {
    testWidgets('tombol submit disabled saat isLoading true', (tester) async {
      await tester.pumpWidget(
        GetMaterialApp(
          home: LoginView(),
          initialBinding: BindingsBuilder(() {
            Get.put(AuthController(authRepo: mockRepo));
          }),
        ),
      );

      controller.isLoading.value = true;
      await tester.pump();

      final button = find.byType(ElevatedButton);
      expect(tester.widget<ElevatedButton>(button).onPressed, isNull);
    });
  });
}
```

---

## Test Patterns — flutter_test (Riverpod)

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mockito/mockito.dart';

// Unit test — provider/notifier
void main() {
  group('AuthNotifier', () {
    late ProviderContainer container;

    setUp(() {
      container = ProviderContainer(
        overrides: [
          // Override dependency dengan mock
          authRepositoryProvider.overrideWithValue(MockAuthRepository()),
        ],
      );
    });

    tearDown(() => container.dispose());

    test('login berhasil → isAuthenticated true', () async {
      final mockRepo = container.read(authRepositoryProvider) as MockAuthRepository;
      when(mockRepo.login(any, any)).thenAnswer((_) async => fakeUser);

      await container.read(authProvider.notifier).login('test@test.com', 'pass123');

      expect(container.read(authProvider).isAuthenticated, true);
      expect(container.read(authProvider).user, fakeUser);
    });

    test('login gagal → error message muncul', () async {
      final mockRepo = container.read(authRepositoryProvider) as MockAuthRepository;
      when(mockRepo.login(any, any)).thenThrow(Exception('Invalid credentials'));

      await container.read(authProvider.notifier).login('wrong@test.com', 'wrong');

      expect(container.read(authProvider).error, isNotNull);
      expect(container.read(authProvider).isAuthenticated, false);
    });
  });

  // Widget test
  group('LoginPage', () {
    testWidgets('tombol login disabled saat loading', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authProvider.overrideWith(() => LoadingAuthNotifier()),
          ],
          child: const MaterialApp(home: LoginPage()),
        ),
      );

      final loginButton = find.byType(ElevatedButton);
      expect(tester.widget<ElevatedButton>(loginButton).onPressed, isNull);
    });

    testWidgets('validasi email kosong muncul error', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(child: MaterialApp(home: LoginPage())),
      );

      await tester.tap(find.text('Masuk'));
      await tester.pump();

      expect(find.text('Email wajib diisi'), findsOneWidget);
    });
  });
}
```

---

## Security Checklist Flutter

- [ ] Token JWT disimpan di `flutter_secure_storage`, bukan `SharedPreferences`
- [ ] API base URL tidak di-hardcode — pakai `const` dari config atau flavors
- [ ] Certificate pinning dipertimbangkan untuk app production
- [ ] Debug log (`print`, `debugPrint`) dihapus sebelum release
- [ ] ProGuard/R8 diaktifkan untuk Android release build
- [ ] Sensitive data tidak disimpan di widget state yang bisa di-inspect
- [ ] Deep link divalidasi sebelum diproses
- [ ] `flutter_dotenv` atau flavor dipakai untuk config per environment

---

## Checklist Integrasi Flutter ↔ Backend (NestJS + Knex)

Checklist ini khusus untuk memastikan komunikasi Flutter ke backend NestJS berjalan benar.

### HTTP Client (Dio)
- [ ] Base URL dikonfigurasi dari env/flavor — bukan hardcode
- [ ] `Authorization: Bearer <token>` otomatis ditambahkan via interceptor
- [ ] Auto refresh token saat response 401 — jangan langsung logout
- [ ] Timeout dikonfigurasi: `connectTimeout` dan `receiveTimeout` (min 15 detik)
- [ ] Error response dari NestJS diparse dengan benar — format `{ success, message, data }`
- [ ] `DioException` di-catch dan dikonversi ke error message yang user-friendly
- [ ] Request di-cancel saat widget di-dispose (pakai `CancelToken`)

### Response Handling dari NestJS
- [ ] Model class punya `fromJson()` factory — jangan akses `response.data['key']` langsung
- [ ] Pagination response diparse via `PaginatedResult` model — ada `data` dan `meta`
- [ ] Field nullable di model dideklarasikan dengan `?` — jangan asumsi selalu ada
- [ ] `created_at` / `updated_at` diparse sebagai `DateTime`, bukan `String`
- [ ] Enum dari backend (misal status: 'active'/'inactive') dikonversi ke Dart enum

### Contoh Model sesuai Response NestJS
```dart
// Model sesuai IUserPublic dari backend
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

  factory UserModel.fromJson(Map<String, dynamic> json) => UserModel(
    id:        json['id'] as int,
    name:      json['name'] as String,
    email:     json['email'] as String,
    role:      json['role'] as String,
    isActive:  json['is_active'] == 1 || json['is_active'] == true,
    createdAt: DateTime.parse(json['created_at'] as String),
  );

  Map<String, dynamic> toJson() => {
    'id': id, 'name': name, 'email': email,
    'role': role, 'is_active': isActive ? 1 : 0,
  };
}
```

### Contoh Pagination Response Model
```dart
// Sesuai PaginatedResult<T> dari backend NestJS
class PaginatedResult<T> {
  final List<T> data;
  final PaginationMeta meta;

  const PaginatedResult({ required this.data, required this.meta });

  factory PaginatedResult.fromJson(
    Map<String, dynamic> json,
    T Function(Map<String, dynamic>) fromJsonT,
  ) => PaginatedResult(
    data: (json['data'] as List).map((e) => fromJsonT(e)).toList(),
    meta: PaginationMeta.fromJson(json['meta']),
  );
}

class PaginationMeta {
  final int page;
  final int limit;
  final int total;
  final int totalPages;

  const PaginationMeta({
    required this.page, required this.limit,
    required this.total, required this.totalPages,
  });

  factory PaginationMeta.fromJson(Map<String, dynamic> json) => PaginationMeta(
    page:       json['page'] as int,
    limit:      json['limit'] as int,
    total:      json['total'] as int,
    totalPages: json['totalPages'] as int,
  );
}
```

### Export (Download Excel & PDF dari Flutter)
- [ ] Download file Excel/PDF menggunakan `dio.download()` bukan `http.get()`
- [ ] Permission storage diminta sebelum simpan file (`permission_handler`)
- [ ] Path file disimpan di direktori yang tepat: `getApplicationDocumentsDirectory()` (iOS) atau `getExternalStorageDirectory()` (Android)
- [ ] Progress download ditampilkan ke user via `onReceiveProgress`
- [ ] File dibuka setelah download selesai menggunakan `open_file` package
- [ ] Error handling: storage penuh, permission ditolak, network timeout

```dart
// ✅ Contoh download Excel dari NestJS endpoint
Future<void> downloadExcel(String dateFrom, String dateTo) async {
  final dir = await getApplicationDocumentsDirectory();
  final filePath = '${dir.path}/laporan-${DateTime.now().millisecondsSinceEpoch}.xlsx';

  try {
    await dio.download(
      '/api/v1/export/users/excel',
      filePath,
      queryParameters: { 'dateFrom': dateFrom, 'dateTo': dateTo },
      onReceiveProgress: (received, total) {
        if (total != -1) {
          final progress = received / total;
          // update UI progress bar
        }
      },
      options: Options(
        headers: { 'Authorization': 'Bearer $token' },
        responseType: ResponseType.bytes,
      ),
    );
    // Buka file setelah berhasil
    await OpenFile.open(filePath);
  } on DioException catch (e) {
    // Handle error
    throw Exception('Gagal download: ${e.message}');
  }
}
```

### Bug Patterns Integrasi Flutter ↔ Backend

```dart
// ❌ Bug: parse response tanpa null safety → crash saat field kosong
final name = response.data['user']['name']; // crash jika user null

// ✅ Fix: pakai model fromJson dengan null safety
final user = UserModel.fromJson(response.data['data']);

// ❌ Bug: is_active dari MySQL (0/1) tidak dihandle — selalu false
final isActive = json['is_active'] as bool; // error! MySQL return int bukan bool

// ✅ Fix: handle int dan bool
final isActive = json['is_active'] == 1 || json['is_active'] == true;

// ❌ Bug: tidak handle pagination — load semua data sekaligus
final users = await api.getUsers(); // bisa ribuan data → OOM

// ✅ Fix: gunakan pagination dengan lazy loading
final result = await api.getUsers(page: _currentPage, limit: 20);
_currentPage++;

// ❌ Bug: token tidak di-refresh → user tiba-tiba logout
dio.interceptors.add(InterceptorsWrapper(
  onError: (e, handler) {
    if (e.response?.statusCode == 401) {
      Get.offAllNamed('/login'); // langsung logout!
    }
  },
));

// ✅ Fix: coba refresh token dulu sebelum logout
onError: (e, handler) async {
  if (e.response?.statusCode == 401) {
    final refreshed = await _tryRefreshToken();
    if (refreshed) {
      // retry request original
      return handler.resolve(await dio.fetch(e.requestOptions));
    }
    Get.offAllNamed('/login');
  }
  handler.next(e);
},
```

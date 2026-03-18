---
applyTo: "**/*.dart"
---

# Flutter Mobile Instructions

Sebelum menulis atau mengedit kode Flutter, baca file referensi berikut:
- `.claude/folder-structure-mobile.md` — struktur folder wajib
- `.claude/checklist-flutter.md` — checklist review kode Flutter/Dart

## Aturan Wajib Flutter

- **Alur wajib**: View → Controller → Repository → Dio → Backend
- API call WAJIB di `*_repository.dart` — DILARANG di controller
- Dio singleton via `DioClient.instance` — DILARANG buat instance baru
- Token JWT di `flutter_secure_storage` — DILARANG di `SharedPreferences`
- `Obx()` hanya wrap widget yang reaktif — DILARANG wrap seluruh Scaffold
- `TextEditingController` wajib di-dispose di `onClose()`
- Route string WAJIB pakai `AppRoutes` constant

## Contoh Struktur Fitur

```
lib/features/[feature]/
├── bindings/[feature]_binding.dart
├── controllers/[feature]_controller.dart
├── models/[feature]_model.dart
├── repositories/[feature]_repository.dart  ← Semua API call di sini
└── views/[feature]_view.dart
```

## Model Pattern

```dart
// ✅ WAJIB — model selalu punya fromJson
factory FeatureModel.fromJson(Map<String, dynamic> json) => FeatureModel(
  id: json['id'] as int,
  isActive: json['is_active'] == 1 || json['is_active'] == true, // MySQL int!
);
```

## Error Handling Pattern

```dart
// ✅ Controller — catch AppException
try {
  await _repo.getData()
} on AppException catch (e) {
  errorMsg.value = e.message
  AppSnackbar.error(e.message)
}
```

## Larangan

- DILARANG API call di controller — harus di repository
- DILARANG `json['field'] as bool` untuk field MySQL — MySQL return int (0/1)
- DILARANG `DioClient()` baru — pakai `DioClient.instance`
- DILARANG token JWT di `SharedPreferences` — pakai `flutter_secure_storage`
- DILARANG hardcode route string — pakai `AppRoutes`

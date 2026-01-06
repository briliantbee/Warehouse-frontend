# Implementasi Upload Foto Aset 4 Sisi

## Fitur Baru

Ditambahkan fitur upload foto aset dari 4 sisi berbeda:

1. **Samping Kanan/Kiri**
2. **Atas**
3. **Depan**
4. **Belakang**

## Validasi

- **Format File**: JPG, JPEG, PNG, GIF, BMP
- **Ukuran Maksimal**: 2MB per foto
- **Jumlah Maksimal**: 4 foto
- **Sifat**: Opsional (tidak wajib diisi)

## Perubahan File

### 1. CreateAssetModal.tsx

- Ditambahkan state `fotoFiles` dan `fotoPreview`
- Ditambahkan section UI untuk upload 4 foto dengan preview
- Update interface untuk menerima parameter `fotoFiles` di callback `onSubmit`
- Validasi client-side untuk format dan ukuran file

### 2. EditAssetModal.tsx

- Ditambahkan state `fotoFiles`, `fotoPreview`, dan `existingFotos`
- Menampilkan foto yang sudah ada dari database
- Fitur delete foto existing
- Upload foto baru dengan preview
- Update interface untuk menerima parameter `fotoFiles` di callback `onSubmit`

### 3. page.tsx (Admin Products)

- Update `handleCreateAset` untuk menangani FormData dengan foto
- Update `handleUpdateAset` untuk menangani FormData dengan foto
- Menggunakan `multipart/form-data` header saat ada foto yang diupload
- Fallback ke JSON biasa jika tidak ada foto

## Penggunaan

### Cara Upload Foto

1. Buka modal Create/Edit Asset
2. Scroll ke bagian "Upload Foto 4 Sisi (Opsional)"
3. Klik pada area upload untuk setiap sisi yang diinginkan
4. Pilih file gambar (JPG, PNG, GIF, atau BMP)
5. Preview akan muncul secara otomatis
6. Klik X untuk menghapus foto jika perlu
7. Submit form seperti biasa

### Format Data yang Dikirim ke Backend

```typescript
// Jika ada foto:
FormData {
  kode_barang: "BRG-001",
  nama_aset: "Laptop Dell",
  // ... field lainnya
  foto_aset[]: File, // foto 1
  foto_aset[]: File, // foto 2
  foto_aset[]: File, // foto 3
  foto_aset[]: File, // foto 4
}

// Jika tidak ada foto:
JSON {
  kode_barang: "BRG-001",
  nama_aset: "Laptop Dell",
  // ... field lainnya
}
```

## Backend Response Format

Backend diharapkan mengembalikan array path untuk foto:

```json
{
  "id": 1,
  "kode_barang": "BRG-001",
  "nama_aset": "Laptop Dell",
  "foto_aset": [
    "asset-photos/asset_1234567890_1.jpg",
    "asset-photos/asset_1234567890_2.jpg",
    "asset-photos/asset_1234567890_3.jpg",
    "asset-photos/asset_1234567890_4.jpg"
  ]
}
```

## Environment Variable

Pastikan `NEXT_PUBLIC_API_URL` sudah di-set untuk menampilkan foto existing:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Catatan

- Foto bersifat opsional, user bisa submit form tanpa upload foto
- Validasi dilakukan di client-side dan server-side
- Foto existing bisa dihapus saat edit
- Preview foto langsung ditampilkan setelah dipilih
- Menggunakan FormData hanya jika ada foto yang diupload untuk efisiensi

<div align="center">

# 🔥 Od

### Azərbaycan dilində proqramlaşdırma dili

**Biz hərfləri qururuq — sözləri və cümlələri siz yazırsınız.**

[▶ Onlayn sına](https://sano8063.github.io/od/) · [📘 Dərslər](https://sano8063.github.io/od/#dersler) · [🔤 Əlifba](docs/ELIFBA.md) · [⚙️ Necə işləyir](docs/NECE-ISLEYIR.md) · [🤝 Töhfə ver](CONTRIBUTING.md)

![Od redaktoru](docs/img/redaktor.png)

</div>

---

## 🇦🇿 Azərbaycanlı developerlərə çağırış

> Python-u bir nəfər başladı, milyonlarla insan böyütdü.
> Od-u da biz başladıq — indi növbə sizdədir.
>
> Hər azərbaycanlı uşaq proqramlaşdırmanı **ana dilində** öyrənə bilməlidir. Biz dilin hərflərini qurduq. Sözləri, cümlələri və kitabları birlikdə yazaq.
>
> Bir funksiya yaz. Bir oyun əlavə et. Bir xətanı düzəlt. Bir müəllimə göstər.
> **Hər kiçik töhfə Azərbaycanda proqramlaşdırmanın gələcəyinə bir kərpicdir.**
>
> ⭐ Repoya ulduz ver · 🍴 Fork et · 🤝 [Töhfə ver](CONTRIBUTING.md) · 📣 Paylaş

## Od nədir?

**Od** — məktəblilər və yeni başlayanlar üçün Azərbaycan dilində yazılan proqramlaşdırma dilidir. Kod brauzerdə dərhal işləyir: quraşdırma, internet və ya ingilis dili lazım deyil.

```
# Rəqəmi tap oyunu
gizli = təsadüfi(1, 100)

nə qədər ki doğru:
    təxmin = daxil_et("Rəqəmin:")
    əgər təxmin == gizli:
        göstər("Afərin! Tapdın 🎉")
        dayan
    yoxsa əgər təxmin < gizli:
        göstər("Daha böyük ⬆")
    yoxsa:
        göstər("Daha kiçik ⬇")
```

## 🏫 Od Sinif — müəllim və şagird üçün

- **Rollar:** müəllim və şagird hesabları (Firebase Auth).
- **Siniflər:** müəllim sinif yaradır, şagirdlər 6 simvollu kodla qoşulur.
- **Ev tapşırıqları:** təsvir, başlanğıc kod, avtomatik testlər, son tarix.
- **Avtomatik yoxlama:** şagirdin kodu müxtəlif girdilərlə işə salınır, nəticə müəllimin panelinə düşür.
- **Müəllim paneli:** göndərişlər cədvəli, qiymət və şərh, göndərməyənlərin siyahısı.
- **Bildirişlər:** yeni və şübhəli göndərişlər real vaxtda gəlir.

### 🛡 Ciddi rejim

Kodun süni intellektlə yazıldığını 100% dəqiq aşkar edən sistem yoxdur. Ona görə Od **siqnalları** göstərir, qərarı isə müəllim verir:

- kod yapışdırma (neçə dəfə, neçə simvol);
- səhifədən çıxma (neçə dəfə, nə qədər);
- aktiv yazma vaxtı və düymə sayı;
- **yazılışın təkrar oynadılması:** müəllim kodun addım-addım necə yazıldığını izləyir.

Şagird ciddi rejimi redaktorun üstündə açıq görür. Gizli izləmə yoxdur.

![Müəllim paneli](docs/img/muellim.png)

## 📘 Od Dərslik — 10 dərslik interaktiv kurs

Od-un içində proqramlaşdırmanı **sıfırdan** öyrədən kurs var: [sano8063.github.io/od/#dersler](https://sano8063.github.io/od/#dersler)

| # | Dərs | Mövzu |
|---|---|---|
| 1 | Salam, dünya! | `göstər` |
| 2 | Dəyişənlər | `ad = dəyər` |
| 3 | Riyaziyyat | `+ − * / % **` |
| 4 | Sual ver, cavab al | `daxil_et()` |
| 5 | Şərtlər | `əgər · yoxsa` |
| 6 | Dövrlər | `təkrarla · hər` |
| 7 | Toplayıcı | `nə qədər ki · +=` |
| 8 | Siyahılar | `[ ] · .böl()` |
| 9 | Funksiyalar | `funksiya · qaytar` |
| 10 | Rəsm qələmi | `irəli · sağa` |

- ✔ **Avtomatik yoxlama.** Şagirdin kodu müxtəlif girdilərlə işə salınır və nəticə yoxlanılır. Əllə yazılmış cavab ("86400") qəbul olunmur, kompüterə hesablatmaq lazımdır.
- 💡 **İpucu**, 3 uğursuz cəhddən sonra isə **cavabı göstər** düyməsi çıxır.
- 💾 **İrəliləyiş yadda qalır.** Hər dərsin kodu ayrıca saxlanılır.
- 🏆 **Sertifikat.** 10 dərsi bitirən şagird adı yazılmış sertifikat yükləyir.
- 🔗 Müəllim birbaşa dərsə link verə bilər: `#ders-5`.

![Od Dərslik](docs/img/dersler.png)

## Niyə Od?

Proqramlaşdırma öyrənən uşaq eyni anda iki çətinliklə üzləşir: **məntiq** və **ingilis dili**. Od ikincisini aradan qaldırır və uşaq yalnız məntiqə fokuslanır. Sonra "⚙️ JavaScript" bölməsində yazdığı kodun ingiliscə qarşılığını görür və əsl dillərə asanlıqla keçir.

## İmkanlar

| | |
|---|---|
| 🇦🇿 **Tam Azərbaycan dilində** | `əgər`, `yoxsa`, `təkrarla`, `funksiya`, `qaytar`… |
| ⌨️ **Hərfsiz yazılış** | `eger` = `əgər`, `sayi` = `sayı` — ə, ş, ç, ğ, ı, ö, ü olmadan da işləyir |
| 💬 **Azərbaycan dilində xətalar** | `Sətir 2: "əgər" sətrinin sonunda ":" unudulub.` |
| 🎮 **Oyunlar** | `kadr()`, `basılıb("sol")`, `toqquşur(...)` — İlan, Kərpic sındır, Kosmik döyüş daxildir |
| 🎨 **Rəsm qələmi** | `irəli(100)`, `sağa(90)`, `rəng("qırmızı")` |
| 🔤 **Yazı stilləri** | `"qalın"`, `"incə"`, `"maili"`, `"xətli"`, `"kod"`, `"klassik"` |
| 🧩 **Obyektlər və xəta tutmaq** | `top = {x: 10, y: 20}`, `sına:` / `xəta olsa:` |
| 🎨 **Ayarlar** | 4 mövzu (qaranlıq, işıqlı, gecə mavisi, yüksək kontrast), 6 vurğu rəngi, şrift ölçüsü |
| 🔒 **Yerli icra** | Kod istifadəçinin brauzerində işləyir; serverə yalnız sinif tapşırığı göndəriləndə gedir |

<table>
<tr>
<td><img src="docs/img/resm.png" alt="Rəsm qələmi"></td>
<td><img src="docs/img/elifba.png" alt="Od əlifbası"></td>
</tr>
<tr>
<td align="center">🎨 Rəsm qələmi</td>
<td align="center">🔤 Od əlifbası — dilin bütün 140 hərfi</td>
</tr>
</table>

## Fəlsəfə

Hər dil hərflərdən başlayır. Azərbaycan əlifbasındakı 32 hərflə bütün ədəbiyyat yazılıb.

| Dil | Proqramlaşdırma | Kim yazır? |
|---|---|---|
| 🔤 Hərflər | Açar sözlər, əsas əmrlər | **Od** |
| 📐 Qrammatika | Sintaksis qaydaları | **Od** |
| 📝 Sözlər | Funksiyalar | **Siz** |
| 💬 Cümlələr | Proqramlar | **Siz** |
| 📚 Kitablar | Kitabxanalar | **İcma** |

## Başlamaq

**Ən asan yol:** [onlayn versiyanı aç](https://sano8063.github.io/od/) və ya `index.html` faylını brauzerdə aç.

**Proqramçılar üçün:**

```bash
git clone https://github.com/Sano8063/od.git
cd od
npm test          # testləri işə sal
npm run build     # src/ qovluğundan index.html yığ
```

Heç bir asılılıq (dependency) yoxdur, yalnız Node.js 18+ lazımdır.

## Layihənin quruluşu

```
od/
├── index.html          ← hazır proqram (npm run build ilə yaradılır)
├── src/
│   ├── engine.js       ← Od-un "beyni": çevirici (transpiler) və icra mühiti
│   ├── examples.js     ← nümunə proqramlar və oyunlar
│   ├── lessons.js      ← 10 dərs və avtomatik yoxlayıcı
│   ├── app.js          ← redaktor, konsol, lövhə, dərslər, ayarlar
│   ├── cloud.js        ← server qatı: Firebase və Demo sürücüləri
│   ├── classroom.js    ← sinif, tapşırıqlar, ciddi rejim, müəllim paneli
│   ├── firebase-config.js
│   ├── styles.css
│   └── template.html   ← səhifənin skeleti
├── firestore.rules     ← verilənlər bazası təhlükəsizlik qaydaları
├── tests/             ← 52 test (dil, dərslər, sinif sistemi)
├── scripts/build.js    ← yığma skripti
└── docs/               ← sənədlər və şəkillər
```

## Yol xəritəsi

- [x] Əsas dil: şərtlər, dövrlər, funksiyalar, siyahılar
- [x] Azərbaycan dilində xəta mesajları
- [x] Rəsm qələmi və oyun funksiyaları
- [x] Obyektlər, `sına` / `xəta olsa`
- [x] Yazı stilləri və Od əlifbası
- [ ] Siniflər: `sinif Oyunçu:`
- [ ] `gətir`: başqa Od fayllarını və kitabxanaları yükləmək
- [x] 10 dərslik kurs, avtomatik yoxlama və sertifikat
- [x] Müəllim/şagird hesabları, siniflər, ev tapşırıqları
- [x] Müəllim paneli, bildirişlər, ciddi rejim
- [x] Peşəkar redaktor dizaynı, mövzular və ayarlar
- [ ] Layihələri saxlamaq və paylaşmaq
- [ ] Səs və 3D

## Müəllif

**Hasan Allahverdi (Sano)** — 🇦🇿 Azərbaycan

## Lisenziya

[MIT](LICENSE) — pulsuz istifadə et, dəyişdir, paylaş.

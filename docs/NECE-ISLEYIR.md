# ⚙️ Od necə işləyir?

Od kodu birbaşa işə salmır. Əvvəlcə onu **JavaScript-ə çevirir** (buna *transpile* deyilir), sonra brauzer həmin JavaScript-i işə salır. Python-un "beyni" C dilində işlədiyi kimi, Od-un "beyni" də JavaScript-in üzərində qurulub.

Bütün məntiq [`src/engine.js`](../src/engine.js) faylındadır, təxminən 700 sətir.

## 5 addım

Nümunə:

```
yaş = 16
əgər yaş >= 18:
    göstər("Böyüksən")
yoxsa:
    göstər("Hələ kiçiksən")
```

### 1. Sətirlərə bölmək — `compile()`
Kod sətirlərə bölünür. Şərhlər (`#`) silinir, hər sətrin əvvəlindəki boşluqlar sayılır. Boşluq nə qədər çoxdursa, sətir o qədər "içəridədir". Bloklar belə tanınır. Açıq qalan mötərizə varsa (`[`, `(`, `{`), növbəti sətir eyni sətrə birləşdirilir.

### 2. Tokenlərə bölmək — `tokenize()`
Hər sətir kiçik parçalara bölünür:

```
əgər | yaş | >= | 18 | :
```

Parçaların növləri: söz (`id`), ədəd (`num`), mətn (`str`), işarə (`op`).

### 3. Sadələşdirmək — `fold()`
Hər söz hərfsiz formaya salınır: `əgər` → `eger`, `yaş` → `yas`. Ona görə `eger` yazsan da, `əgər` yazsan da eyni sözdür. Dəyişən adları da belə işləyir: `sayı` və `sayi` eyni dəyişəndir.

### 4. Tanımaq və çevirmək — `exprFull()` və əsas dövr
- Söz `KW` cədvəlində varsa, **açar sözdür**: `əgər` → `if`.
- Yoxdursa, **istifadəçinin adıdır**. JavaScript-in öz sözləri ilə qarışmasın deyə əvvəlinə `$` qoyulur: `yaş` → `$yas`.

Nəticə:

```javascript
var $yas;
$yas = 16;
if ($yas >= 18) {
  $goster("Böyüksən");
} else {
  $goster("Hələ kiçiksən");
}
```

Burada həm də **təhlükəsizlik** əlavə olunur:
- Hər dövrün içinə "fasilə nöqtəsi" qoyulur. Proqram sonsuz dövrə düşsə də brauzer donmur və **Dayandır** düyməsi işləyir.
- Hər sətrin nömrəsi yadda saxlanılır ki, xəta harada olubsa, düzgün sətri göstərək.

### 5. İşə salmaq — `run()`
JavaScript kodu `AsyncFunction` ilə işə salınır. Daxili funksiyalar (`göstər`, `irəli`, `kadr`…) `makeRuntime()` içindədir. Xəta baş verərsə, `translateError()` onu Azərbaycan dilinə çevirir:

| JavaScript deyir | Od deyir |
|---|---|
| `$x is not defined` | `"x" tapılmadı. Bu adda dəyişən və ya funksiya yaradılmayıb.` |
| `Maximum call stack size exceeded` | `Funksiya özünü dayanmadan çağırır (sonsuz təkrar).` |

## Yeni "hərf" necə əlavə olunur?

**Yeni funksiya.** `makeRuntime()` içindəki `B` obyektinə bir sətir əlavə et. Adı hərfsiz formada yazılır:

```javascript
kok: function (x) { return Math.sqrt(__num(x)); },
```

Artıq Od-da `kök(16)` → `4` işləyir.

**Yeni açar söz.** `KW` cədvəlinə əlavə et, sonra əsas dövrdə onun nəyə çevriləcəyini yaz. Nümunə üçün `sına` / `xəta olsa` hissəsinə bax.

**Yeni metod.** `installProto()` içində `def(Array.prototype, 'ad', function () { ... })`.

Hər dəyişiklikdən sonra `npm test` ilə yoxla və `npm run build` ilə `index.html` faylını yenilə.

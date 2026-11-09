# 🤝 Od-a töhfə vermək

Od icma ilə böyüyür. Hər töhfə dəyərlidir: yeni funksiya, nümunə oyun, xəta düzəlişi, sənəd və ya ideya.

## Necə kömək edə bilərsən?

- **Xəta tapdın?** [Issue aç](https://github.com/Sano8063/od/issues): Od kodunu, gözlədiyin nəticəni və aldığın nəticəni yaz.
- **Yeni nümunə və ya oyun yazdın?** `src/examples.js` faylına əlavə et.
- **Yeni "hərf" (funksiya, açar söz) təklif edirsən?** Əvvəlcə issue aç və müzakirə edək. Dil sadə qalmalıdır.
- **Sənədləri yaxşılaşdırmaq** da böyük köməkdir.

## Qaydalar

1. Açar sözlər və funksiyalar **təbii Azərbaycan dilində** olmalıdır. Uşaq onu oxuyanda başa düşməlidir.
2. Xəta mesajları **sadə və köməkçi** olmalıdır. Müəllim kimi danışmalı, kompüter kimi yox.
3. Hər dəyişiklikdən sonra:
   ```bash
   npm test
   npm run build
   ```
4. Yeni imkan üçün `tests/od.test.js` faylına test əlavə et.

## İşin necə qurulduğunu öyrən

[docs/NECE-ISLEYIR.md](docs/NECE-ISLEYIR.md) faylında Od-un "beyni" addım-addım izah olunub.

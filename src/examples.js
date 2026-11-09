// OD — nümunə proqramlar
var OD_EXAMPLES = [
  { id: 'salam', ad: '👋 Salam, dünya', kod:
`# İlk proqramım
göstər("Salam, dünya!")

ad = "Sano"
yaş = 20
göstər("Xoş gəldin, " + ad + "!")
göstər("10 ildən sonra", yaş + 10, "yaşında olacaqsan.")`
  },
  { id: 'oyun', ad: '🎯 Rəqəmi tap oyunu', kod:
`# Kompüter rəqəm tutur, sən tapırsan
gizli = təsadüfi(1, 100)
cəhd = 0
göstər("1 ilə 100 arasında bir rəqəm tutdum. Tap görüm!")

nə qədər ki doğru:
    təxmin = daxil_et("Rəqəmin:")
    cəhd += 1
    əgər təxmin == gizli:
        göstər("Afərin! " + cəhd + " cəhddə tapdın 🎉")
        dayan
    yoxsa əgər təxmin < gizli:
        göstər(təxmin, "— daha böyük ⬆")
    yoxsa:
        göstər(təxmin, "— daha kiçik ⬇")`
  },
  { id: 'cedvel', ad: '✖️ Vurma cədvəli', kod:
`# 1-dən 9-a qədər vurma cədvəli
hər i aralıq(1, 9) içində:
    sətir = ""
    hər j aralıq(1, 9) içində:
        sətir = sətir + metn(i * j) + "\\t"
    göstər(sətir)`
  },
  { id: 'ilan', ad: '🐍 Oyun: İlan', kod:
`# 🐍 İLAN — ox düymələri ilə idarə et, almaları ye!
xana = 20
ilan = [{x: 15, y: 15}, {x: 14, y: 15}, {x: 13, y: 15}]
istiqamət = "sağ"
növbəti = "sağ"
alma = {x: təsadüfi(0, 29), y: təsadüfi(0, 29)}
xal = 0
sayğac = 0
gecikmə = 8
bitdi = yalan

nə qədər ki deyil bitdi:
    # Düymələr (geriyə dönmək olmaz)
    əgər basılıb("yuxarı") və istiqamət != "aşağı":
        növbəti = "yuxarı"
    yoxsa əgər basılıb("aşağı") və istiqamət != "yuxarı":
        növbəti = "aşağı"
    yoxsa əgər basılıb("sol") və istiqamət != "sağ":
        növbəti = "sol"
    yoxsa əgər basılıb("sağ") və istiqamət != "sol":
        növbəti = "sağ"

    sayğac += 1
    əgər sayğac >= gecikmə:
        sayğac = 0
        istiqamət = növbəti
        baş = ilan[0]
        yeni = {x: baş.x, y: baş.y}
        əgər istiqamət == "yuxarı":
            yeni.y -= 1
        yoxsa əgər istiqamət == "aşağı":
            yeni.y += 1
        yoxsa əgər istiqamət == "sol":
            yeni.x -= 1
        yoxsa:
            yeni.x += 1

        # Divara və ya özünə dəydimi?
        əgər yeni.x < 0 və ya yeni.x > 29 və ya yeni.y < 0 və ya yeni.y > 29:
            bitdi = doğru
        hər hissə ilan içində:
            əgər hissə.x == yeni.x və hissə.y == yeni.y:
                bitdi = doğru

        əgər deyil bitdi:
            ilan.əvvələ_əlavə_et(yeni)
            əgər yeni.x == alma.x və yeni.y == alma.y:
                xal += 1
                alma = {x: təsadüfi(0, 29), y: təsadüfi(0, 29)}
                əgər xal % 4 == 0 və gecikmə > 3:
                    gecikmə -= 1
            yoxsa:
                ilan.sil(ilan.uzunluq - 1)

    # Çək
    lövhəni_təmizlə("#0c1a12")
    dairə_çək(alma.x * xana + 10, alma.y * xana + 10, 8, "qırmızı")
    hər i aralıq(0, ilan.uzunluq - 1) içində:
        h = ilan[i]
        rəng = "yaşıl"
        əgər i == 0:
            rəng = "#b6f36a"
        düzbucaqlı(h.x * xana + 1, h.y * xana + 1, xana - 2, xana - 2, rəng)
    mətn_yaz("Xal: " + xal, 12, 10, 20, "ağ")
    kadr()

mərkəzdə_yaz("OYUN BİTDİ", 250, 48, "sarı")
mərkəzdə_yaz("Xalın: " + xal + "  ·  Yenidən: ▶ İşə sal", 315, 20, "ağ")
göstər("🐍 Oyun bitdi! Xalın:", xal)`
  },
  { id: 'kerpic', ad: '🧱 Oyun: Kərpic sındır', kod:
`# 🧱 KƏRPİC SINDIR — sol/sağ oxları ilə raketkanı idarə et
raket = {x: 250, y: 560, en: 110, hünd: 12}
top = {x: 300, y: 420, r: 8, dx: 4, dy: -5}
rənglər = ["qırmızı", "narıncı", "sarı", "yaşıl", "mavi"]
kərpiclər = []
hər sıra aralıq(0, 4) içində:
    hər sütun aralıq(0, 9) içində:
        kərpiclər.əlavə_et({x: 6 + sütun * 59, y: 70 + sıra * 26, en: 54, hünd: 20, rəng: rənglər[sıra]})
xal = 0
can = 3

nə qədər ki can > 0 və kərpiclər.uzunluq > 0:
    # Raketka
    əgər basılıb("sol"):
        raket.x -= 9
    əgər basılıb("sağ"):
        raket.x += 9
    raket.x = ən_böyük(0, ən_kiçik(600 - raket.en, raket.x))

    # Top hərəkəti və divarlar
    top.x += top.dx
    top.y += top.dy
    əgər top.x < top.r və ya top.x > 600 - top.r:
        top.dx = -top.dx
    əgər top.y < top.r:
        top.dy = mütləq(top.dy)

    # Raketkaya dəydi
    əgər top.dy > 0 və toqquşur(top.x - top.r, top.y - top.r, top.r * 2, top.r * 2, raket.x, raket.y, raket.en, raket.hünd):
        top.dy = -mütləq(top.dy)
        top.dx = (top.x - (raket.x + raket.en / 2)) / 9

    # Kərpicə dəydi
    hər k kərpiclər içində:
        əgər toqquşur(top.x - top.r, top.y - top.r, top.r * 2, top.r * 2, k.x, k.y, k.en, k.hünd):
            kərpiclər.çıxar(k)
            top.dy = -top.dy
            xal += 10
            dayan

    # Top düşdü
    əgər top.y > 620:
        can -= 1
        top = {x: 300, y: 420, r: 8, dx: 4, dy: -5}

    # Çək
    lövhəni_təmizlə("#0d0f1a")
    hər k kərpiclər içində:
        düzbucaqlı(k.x, k.y, k.en, k.hünd, k.rəng)
    düzbucaqlı(raket.x, raket.y, raket.en, raket.hünd, "ağ")
    dairə_çək(top.x, top.y, top.r, "sarı")
    mətn_yaz("Xal: " + xal, 12, 14, 20, "ağ")
    mətn_yaz("Can: " + "❤".təkrar(can), 460, 14, 20, "çəhrayı")
    kadr()

əgər kərpiclər.uzunluq == 0:
    mərkəzdə_yaz("QALİB GƏLDİN! 🏆", 260, 44, "qızılı")
yoxsa:
    mərkəzdə_yaz("OYUN BİTDİ", 260, 48, "qırmızı")
mərkəzdə_yaz("Xal: " + xal, 325, 24, "ağ")
göstər("🧱 Xalın:", xal)`
  },
  { id: 'kosmos', ad: '🚀 Oyun: Kosmik döyüş', kod:
`# 🚀 KOSMİK DÖYÜŞ — sol/sağ ilə uç, boşluq ilə atəş aç
gəmi = {x: 280, y: 530}
güllələr = []
düşmənlər = []
ulduzlar = []
təkrarla 70 dəfə:
    ulduzlar.əlavə_et({x: təsadüfi(0, 600), y: təsadüfi(0, 600), s: təsadüfi(1, 3)})
xal = 0
can = 3
kadr_sayı = 0
soyuma = 0

funksiya gəmini_çək(x, y):
    üçbucaq(x + 20, y, x, y + 40, x + 40, y + 40, "göy")
    düzbucaqlı(x + 16, y + 40, 8, 6, "narıncı")

funksiya düşməni_çək(d):
    düzbucaqlı(d.x, d.y, 40, 26, "bənövşəyi")
    düzbucaqlı(d.x + 8, d.y + 8, 7, 7, "sarı")
    düzbucaqlı(d.x + 25, d.y + 8, 7, 7, "sarı")

nə qədər ki can > 0:
    kadr_sayı += 1

    # Hərəkət
    əgər basılıb("sol"):
        gəmi.x -= 7
    əgər basılıb("sağ"):
        gəmi.x += 7
    gəmi.x = ən_böyük(0, ən_kiçik(560, gəmi.x))

    # Atəş
    soyuma -= 1
    əgər basılıb("boşluq") və soyuma <= 0:
        güllələr.əlavə_et({x: gəmi.x + 18, y: gəmi.y - 10})
        soyuma = 9

    # Yeni düşmən (oyun getdikcə çətinləşir)
    əgər kadr_sayı % ən_böyük(14, 45 - tam_böl(xal, 50)) == 0:
        düşmənlər.əlavə_et({x: təsadüfi(0, 560), y: -30, sürət: təsadüfi(2, 4) + xal / 300})

    # Yenilə
    hər u ulduzlar içində:
        u.y += u.s
        əgər u.y > 600:
            u.y = 0
            u.x = təsadüfi(0, 600)
    hər g güllələr içində:
        g.y -= 10
        əgər g.y < -20:
            güllələr.çıxar(g)
    hər d düşmənlər içində:
        d.y += d.sürət
        əgər toqquşur(d.x, d.y, 40, 26, gəmi.x + 6, gəmi.y + 6, 28, 34):
            can -= 1
            düşmənlər.çıxar(d)
        yoxsa əgər d.y > 600:
            düşmənlər.çıxar(d)
            xal -= 5

    # Güllə düşmənə dəydi
    hər g güllələr içində:
        hər d düşmənlər içində:
            əgər toqquşur(g.x, g.y, 4, 12, d.x, d.y, 40, 26):
                güllələr.çıxar(g)
                düşmənlər.çıxar(d)
                xal += 10
                dayan

    # Çək
    lövhəni_təmizlə("#05060f")
    hər u ulduzlar içində:
        düzbucaqlı(u.x, u.y, u.s, u.s, "#8890b5")
    hər g güllələr içində:
        düzbucaqlı(g.x, g.y, 4, 12, "sarı")
    hər d düşmənlər içində:
        düşməni_çək(d)
    gəmini_çək(gəmi.x, gəmi.y)
    mətn_yaz("Xal: " + xal, 12, 12, 20, "ağ")
    mətn_yaz("Can: " + "❤".təkrar(ən_böyük(can, 0)), 470, 12, 20, "çəhrayı")
    kadr()

mərkəzdə_yaz("GƏMİ VURULDU 💥", 250, 44, "narıncı")
mərkəzdə_yaz("Xalın: " + xal, 315, 26, "ağ")
göstər("🚀 Oyun bitdi! Xalın:", xal)`
  },
  { id: 'yazi', ad: '🔤 Yazı stilləri', kod:
`# Yazı stilləri: qalın, incə, maili, xətli...
lövhəni_təmizlə("#11131a")
mərkəzdə_yaz("Od dilində yazılar", 30, 38, "narıncı", "qalın")

mətn_yaz("Adi yazı", 40, 110, 28, "ağ", "adi")
mətn_yaz("Qalın yazı", 40, 155, 28, "ağ", "qalın")
mətn_yaz("İncə yazı", 40, 200, 28, "ağ", "incə")
mətn_yaz("Maili (italik) yazı", 40, 245, 28, "ağ", "maili")
mətn_yaz("Qalın + maili", 40, 290, 28, "sarı", "qalın maili")
mətn_yaz("Altından xətt", 40, 335, 28, "göy", "xətli")
mətn_yaz("Üstündən xətt", 40, 380, 28, "boz", "üstüxətli")
mətn_yaz("kod_şrifti = 42", 40, 425, 26, "yaşıl", "kod")
mətn_yaz("Klassik şrift, maili", 40, 470, 28, "çəhrayı", "klassik maili")

# Ölçülər
ölçü = 12
x = 40
hər i aralıq(1, 6) içində:
    mətn_yaz("Aa", x, 530, ölçü, "ağ", "qalın")
    x += ölçü * 1.6
    ölçü += 6`
  },
  { id: 'funksiya', ad: '🧮 Funksiyalar', kod:
`# Öz funksiyanı yarat
funksiya faktorial(n):
    əgər n <= 1:
        qaytar 1
    qaytar n * faktorial(n - 1)

funksiya fibonaççi(say):
    a = 0
    b = 1
    nəticə = []
    təkrarla say dəfə:
        nəticə.əlavə_et(a)
        c = a + b
        a = b
        b = c
    qaytar nəticə

göstər("5! =", faktorial(5))
göstər("10! =", faktorial(10))
göstər("Fibonaççi:", fibonaççi(12))`
  },
  { id: 'siyahi', ad: '📋 Siyahılar', kod:
`# Siyahılarla iş
meyvələr = ["alma", "nar", "heyva", "üzüm"]
meyvələr.əlavə_et("əncir")

göstər("Meyvə sayı:", meyvələr.uzunluq)
hər m meyvələr içində:
    göstər("• " + m.böyük())

qiymətlər = [3, 7, 2, 9, 5]
göstər("Cəm:", cəm(qiymətlər))
göstər("Ən böyük:", ən_böyük(qiymətlər))
göstər("Sıralanmış:", qiymətlər.sırala())

əgər meyvələr.var("nar") və deyil meyvələr.var("banan"):
    göstər("Nar var, banan yoxdur 🍎")`
  },
  { id: 'resm', ad: '🎨 Rəngli spiral', kod:
`# Qələm ilə rəsm çək
rənglər = ["qırmızı", "narıncı", "sarı", "yaşıl", "mavi", "bənövşəyi"]
arxa_fon("qara")
sürət(8)
qalınlıq(2)

hər i aralıq(1, 140) içində:
    rəng(rənglər[i % 6])
    irəli(i * 1.6)
    sağa(59)`
  },
  { id: 'ulduz', ad: '⭐ Ulduzlar', kod:
`# Funksiya ilə ulduz çək
funksiya ulduz(ölçü, r):
    rəng(r)
    təkrarla 5 dəfə:
        irəli(ölçü)
        sağa(144)

sürət(6)
qalınlıq(3)
rənglər = ["sarı", "qızılı", "narıncı", "çəhrayı", "göy"]
hər i aralıq(0, 4) içində:
    qələm_qaldır()
    mərkəzə()
    sola(i * 72)
    irəli(60)
    qələm_endir()
    ulduz(70, rənglər[i])`
  },
  { id: 'herfsiz', ad: '⌨️ Hərfsiz yazı', kod:
`# ə, ş, ç, ğ, ı, ö, ü olmadan da işləyir!
# "goster" = "göstər", "eger" = "əgər"
sayi = 7
eger sayi % 2 == 0:
    goster(sayi, "cüt ədəddir")
yoxsa:
    goster(sayi, "tək ədəddir")

tekrarla 3 defe:
    goster("Azərbaycan dilində kod! 🇦🇿")

# Dəyişənlər də eynidir: "sayı" = "sayi"
goster("sayı =", sayı)`
  }
];
if (typeof module !== 'undefined') module.exports = OD_EXAMPLES;

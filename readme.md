# Invite

Github içerisinde kullanabileceğiniz JSON tabanlı anlaşılır bir invite manager botu. <br>
Genel bakış: **[TODO](#Todo) - [Özellikler](#Özellikler) - [Nasıl kurulur](#Kurulum) - [Dipnot](#Dipnot)**

## Genel Giriş

### Özellikler

Bildiğiniz diğer invite managerlerin özelliklerinden farklı olanları yazacağım.

- Temporary (geçici) inviteleri cacheleme
- Tek kullanımlık inviteleri cacheleme
- Değiştirilebilir gün ile gelen davetin sahte olup olmadığını belirleme
- Saniyelik database kayıt edilmesi
- Çökme durumunda databasenin kayıt edilmesi
- Senkronize bir şekilde çalışması

### Kurulum

Sadece config dosyalarında belirtilen şeyleri kendi sunucunuza göre hazırlayın. <br>
Hazırladıktan sonra dosyaların bulunduğu klasörde bir terminal (cmd) açın. <br>
CMDnizi veya terminalinizi açtıktan sonra `cd src` yazarak dosyaya girin. <br>
Açtıktan sonra şu komutu girerek modülleri indirin: `npm install` <br>
Modülleri indirdikten sonra botu başlatmak için `node index.js` yazabilirsiniz.

### Dipnot

Bu bot, çoklu sunucular için **yaratılmamıştır!** <br>
Eğer çoklu sunucular için bir bot istiyorsanız, aradığınız bot bu değil. <br>
Eğer kodlama biliyorsanız, database sisteminizi kendi database sisteminize uyarlayabilirsiniz. <br>

Eğer çoklu sunucularda kullanmak istiyorsanız, database olarak **MongoDB** öneriyorum çünkü <br>
NoSQL (not only SQL) olduğundan JSON databasenin yaptığı görevin aynısını çok daha rahat uyarlayabilirsiniz.

### Todo

Üşenmezsem yapacaklarım:

- [ ] Reward sistemi (invite başına ödül)
- [ ] Gelen kişiyi belirli kriterlere göre planlayarak invitenin gerçek olup olmadığını hesaplamak
- [ ] Bonus invite sistemi (invite ekleyip çıkart)
- [ ] Invite blacklist
- [ ] Invite whitelist (eğer aktif edilirse)
- [ ] Invite database reset
  - Aslında database klasörünün içindekilerini `[]` yaparak resetleyebilirsiniz ama bunu bir komutla da yapabiliriz.
- [ ] Config ile gelen giriş ve çıkış mesajları

/**
 * Burada basit olarak kullanıcının daveti gerçek mi değil mi diye
 * kontrol ediyoruz. Sadece katılanın hesabının kaç gün önce oluşturulduğuna
 * bakarak. Ben burada 14 gün yaptım, siz istediğiniz gibi değiştirebilirsiniz.
 */

function fakeCheck(member) {
  return Boolean(Date.now() - member.user.createdAt < 1000 * 60 * 60 * 24 * 14);
}

function createdAtCheck(createdAt) {
  if (!createdAt) return false;
  return Boolean(Date.now() - createdAt < 1000 * 60 * 60 * 24 * 14);
}

module.exports = { fakeCheck, createdAtCheck };

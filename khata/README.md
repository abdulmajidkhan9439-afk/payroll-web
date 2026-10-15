# Mera Khata (میرا کھاتہ)

Ek simple, offline udhaar khata web-app jo customers aur suppliers ka hisaab rakhta hai.
Yeh khud likha gaya (clean-room) app hai — kisi aur app ka code ya design copy nahi kiya gaya.

## Features
- Customers aur suppliers ke alag khatay
- "Aap ne diye" / "Aap ne liye" entries, har entry ke baad running balance
- Home par total: aap ne kitne lene hain / dene hain
- Naam ya phone number se search
- WhatsApp payment reminder (Pakistani `03XX` number khud `92` format mein badal jata hai)
- Call button, print / PDF report
- Urdu (RTL) aur English, light/dark mode
- JSON backup download aur restore
- PWA: phone par "Add to Home screen" karke offline chalta hai

## Data
Sara data sirf isi browser/phone ke andar (localStorage) save hota hai, kisi server par nahi jata.
Browser data clear karne se data mit sakta hai, is liye **Settings → Backup** se baqaidgi se backup lein.

## Chalana
Kisi bhi static host par `khata/` folder deploy karein, ya local test ke liye:

```bash
cd khata && python3 -m http.server 8000
# phir http://localhost:8000 kholein
```

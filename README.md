# 🖋️ Handwriting Digit Predictor (FastAPI + Next.js + TensorFlow)

এই প্রজেক্টটি একটি ফুল-স্ট্যাক হ্যান্ডরাইটিং ডিজিট প্রেডিক্টর অ্যাপলিকেশন। এখানে আপনার জুপিটার নোটবুক ([Hand_Writting_Predection.ipynb](file:///Users/samio/Documents/ML%20Works/DL_PROJECTS/HandWrittingPredictor/Hand_Writting_Predection.ipynb)) এর MNIST ডিপ লার্নিং মডেলকে **FastAPI Backend** এবং **Next.js Frontend** ড্রয়িং ক্যানভাসের মাধ্যমে সরাসরি লাইভ এবং ব্যবহার উপযোগী করা হয়েছে।

---

## 📁 প্রজেক্ট স্ট্রাকচার (Project Structure)

```
HandWrittingPredictor/
├── Hand_Writting_Predection.ipynb   # মূল জুপিটার নোটবুক (Training & Testing)
├── train_and_save_model.py          # নোটবুকের মডেল ট্রেন করে .keras সেভ করার স্ক্রিপ্ট
├── backend/
│   ├── main.py                      # FastAPI Backend Server (Image Base64 -> Preprocess -> Predict)
│   ├── requirements.txt             # পাইথন প্যাকেজের লিস্ট
│   └── handwriting_model.keras      # ট্রেন করা Keras Model File
├── frontend/
│   ├── app/                         # Next.js App Router (Page, Layout, Styles)
│   ├── components/
│   │   └── DigitCanvas.jsx          # ক্যানভাস ও রেসপন্স ডিসপ্লে কম্পোনেন্ট
│   ├── package.json                 # Node.js নির্ভরতার লিস্ট
│   └── next.config.js               # Next.js কনফিগারেশন
└── README.md                        # প্রজেক্ট রান করার নির্দেশিকা
```

---

## 🚀 লোকালি রান করার নিয়ম (Step-by-Step Instructions)

### ধাপ ১: ভার্চুয়াল এনভায়রনমেন্ট সক্রিয় ও মডেল তৈরি করা

টের্মিনালে প্রজেক্টের রুট ফোল্ডারে থাকুন এবং ভার্চুয়াল এনভায়রনমেন্ট সক্রিয় করে মডেল ট্রেনিং স্ক্রিপ্টটি চালান:

```bash
# ১. ভার্চুয়াল এনভায়রনমেন্ট একটিভ করুন
source .venv/bin/activate

# ২. মডেল ট্রেন করে backend/handwriting_model.keras সেভ করুন
python train_and_save_model.py
```

---

### ধাপ ২: FastAPI ব্যাকএন্ড সার্ভার চালু করা

```bash
# Backend ফোল্ডারে ইউভিকর্ন দিয়ে সার্ভার রান করুন
.venv/bin/uvicorn backend.main:app --reload --port 8000
```
- ব্যাকএন্ড সার্ভারটি `http://localhost:8000` এ রান হবে।
- ইন্টারেক্টিভ API ডকুমেন্টেশন দেখতে ব্রাউজারে `http://localhost:8000/docs` দেখুন।

---

### ধাপ ৩: Next.js ফ্রন্টএন্ড ড্যাশবোর্ড চালু করা

নতুন একটি টের্মিনাল উইন্ডো খুলুন এবং নিচের নির্দেশাবলী অনুসরণ করুন:

```bash
# Frontend ফোল্ডারে যান
cd frontend

# ডেভেলপমেন্ট সার্ভার রান করুন
npm run dev
```
- ব্রাউজারে `http://localhost:3000` এ ঢুকলে আধুনিক ডার্ক-থিমযুক্ত ডিজিট ড্রয়িং ক্যানভাস দেখতে পাবেন।

---

## 🎨 অ্যাপলিকেশন ব্যবহারের উপায়

1. ব্রাউজারে `http://localhost:3000` ওপেন করুন।
2. ক্যানভাসের উপর মাউস বা টাচ ব্যবহার করে **০ থেকে ৯** এর মধ্যে যেকোনো সংখ্যা আঁকুন।
3. **Predict Digit** বাটনে ক্লিক করুন।
4. FastAPI ব্যাকএন্ড তাৎক্ষণিকভাবে আপনার আঁকা ছবিটিকে 28x28 গ্রেস্কেলে প্রসেস করে প্রেডিক্ট করা ডিজিট ও Confidence % স্ক্রিনে দেখাবে।
5. পুনরায় ড্র করতে **Clear** বাটনে ক্লিক করুন।

---

## 🌐 ইন্টারনেটে লাইভ (Deploy) করার নিয়ম

1. **FastAPI Backend Deployment (Render / Railway / Hugging Face Spaces):**
   - GitHub রিপোজিটরিতে কোড পুশ করুন।
   - Render.com-এ নতুন Web Service তৈরি করে `backend/` ডিরেক্টরি সিলেক্ট করুন।
   - Start Command দিন: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`

2. **Next.js Frontend Deployment (Vercel):**
   - Vercel.com-এ প্রজেক্ট যুক্ত করুন এবং Root Directory হিসেবে `frontend` সিলেক্ট করুন।
   - `DigitCanvas.jsx` ফাইলের `backendUrl` এর মান আপনার লাইভ FastAPI ব্যাকএন্ডের URL-এ আপডেট করে দিন।

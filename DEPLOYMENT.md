# نشر الباك إند على Vercel

## المتطلبات

1. حساب على [Vercel](https://vercel.com)
2. حساب على [MongoDB Atlas](https://cloud.mongodb.com)
3. حساب على [Cloudinary](https://cloudinary.com)

## الخطوات

### 1. إعداد متغيرات البيئة على Vercel

اذهب إلى [Vercel Dashboard](https://vercel.com/dashboard) وأنشئ مشروع جديد:

```bash
# متغيرات البيئة المطلوبة
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=30d
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CORS_ORIGIN=https://your-frontend-domain.vercel.app
NODE_ENV=production
```

### 2. رفع الكود

```bash
# تثبيت Vercel CLI
npm i -g vercel

# تسجيل الدخول
vercel login

# رفع المشروع
vercel

# أو رفع إلى production
vercel --prod
```

### 3. ربط مع GitHub (مستحسن)

1. اربط مشروع GitHub مع Vercel
2. كل push سيتم النشر تلقائياً
3. يمكنك إعداد preview deployments

### 4. اختبار النشر

```bash
# اختبار health check
curl https://your-api.vercel.app/api/health

# اختبار تسجيل مستخدم
curl -X POST https://your-api.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"123456"}'
```

## ملاحظات مهمة

- **MongoDB Atlas**: تأكد من إضافة IP address الخاص بـ Vercel (0.0.0.0/0)
- **Cloudinary**: تأكد من صحة credentials
- **CORS**: تأكد من تحديث CORS_ORIGIN ليتطابق مع domain الفرونت إند
- **Rate Limiting**: Vercel لديه حدود للـ serverless functions

## استكشاف الأخطاء

### مشاكل شائعة:

1. **خطأ في الاتصال بقاعدة البيانات**
   - تأكد من صحة MONGODB_URI
   - تأكد من إضافة IP addresses في MongoDB Atlas

2. **خطأ في CORS**
   - تأكد من صحة CORS_ORIGIN
   - تأكد من إعدادات CORS في الكود

3. **خطأ في Cloudinary**
   - تأكد من صحة credentials
   - تأكد من إعدادات Cloudinary

### فحص السجلات:

```bash
# فحص سجلات Vercel
vercel logs

# فحص سجلات function محددة
vercel logs --function=api/index.js
```

## تحديث الفرونت إند

بعد النشر، تأكد من تحديث `VITE_API_BASE_URL` في الفرونت إند:

```env
VITE_API_BASE_URL=https://your-api.vercel.app/api
```

## الميزات المتاحة بعد النشر

- ✅ **Serverless Functions**: تكلفة منخفضة، أداء عالي
- ✅ **Auto-scaling**: يتكيف مع الحمل تلقائياً
- ✅ **Global CDN**: سرعة عالية في جميع أنحاء العالم
- ✅ **Automatic Deployments**: نشر تلقائي مع كل تحديث
- ✅ **Environment Variables**: إدارة آمنة للمتغيرات
- ✅ **Analytics**: إحصائيات مفصلة للأداء

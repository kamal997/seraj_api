import nodemailer from 'nodemailer';

// إعداد ناقل البريد الإلكتروني
const transporter = nodemailer.createTransport({
  // host: process.env.SMTP_HOST,
  // port: process.env.SMTP_PORT,
  // secure: process.env.SMTP_SECURE === 'true',
  // auth: {
  //   user: process.env.SMTP_USER,
  //   pass: process.env.SMTP_PASS
  // }
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

/**
 * إرسال بريد إلكتروني
 * @param {Object} options خيارات البريد الإلكتروني
 * @param {string} options.to عنوان المستلم
 * @param {string} options.subject عنوان الرسالة
 * @param {string} options.text نص الرسالة
 * @param {string} [options.html] محتوى HTML للرسالة
 */
export const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text
    };

    if (options.html) {
      mailOptions.html = options.html;
    }

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('فشل في إرسال البريد الإلكتروني');
  }
};

// توحيد التصميم العام لرسائل HTML
const emailWrapper = (title, content) => `
  <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; direction: rtl;">
    <h1 style="color: #4CAF50; text-align: center;">${title}</h1>
    ${content}
    <div style="margin-top: 30px; text-align: center; color: #666;">
      <p>مع تحياتنا،<br>فريق الدعم</p>
    </div>
  </div>
`;


/**
 * إرسال بريد تأكيد البريد الإلكتروني
 * @param {string} to عنوان البريد الإلكتروني
 * @param {string} token رمز التحقق
 */
export const sendVerificationEmail = async (to, token) => {
  const verificationUrl = `${process.env.CLIENT_URL}/auth/verify-email/${token}`;
  const content = `
    <p style="font-size: 16px;">مرحباً،</p>
    <p style="font-size: 16px;">لتأكيد بريدك الإلكتروني، يرجى النقر على الزر التالي:</p>
    <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 4px;">تأكيد البريد الإلكتروني</a>
    <p style="font-size: 16px;">أو انسخ الرابط التالي:</p>
    <p style="font-size: 16px;">${verificationUrl}</p>
    <p style="font-size: 16px;">ينتهي هذا الرابط خلال 24 ساعة.</p>
    <p style="font-size: 16px;">إذا لم تقم بطلب هذا التأكيد، يرجى تجاهل هذا البريد الإلكتروني.</p>
  `;

  await sendEmail({
    to,
    subject: 'تأكيد البريد الإلكتروني',
    text: `مرحباً،\n\nلتأكيد بريدك الإلكتروني، يرجى زيارة الرابط التالي:\n${verificationUrl}\n\nهذا الرابط ينتهي خلال 24 ساعة.\n\nإذا لم تطلب ذلك، تجاهل الرسالة.`,
    html: emailWrapper('تأكيد البريد الإلكتروني', content)
  });
};


/**
 * إرسال بريد إعادة تعيين كلمة المرور
 * @param {string} to عنوان البريد الإلكتروني
 * @param {string} token رمز إعادة التعيين
 */
export const sendPasswordResetEmail = async (to, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password/${token}`;
  const content = `
    <p style="font-size: 16px;">مرحباً،</p>
    <p style="font-size: 16px;">لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك. إذا لم تقم بهذا الطلب، يرجى تجاهل هذا البريد الإلكتروني.</p>
    <p style="font-size: 16px;">لإعادة تعيين كلمة المرور، انقر على الزر التالي:</p>
    <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 4px;">إعادة تعيين كلمة المرور</a>
    <p style="font-size: 16px;">أو انسخ الرابط التالي:</p>
    <p style="font-size: 16px;">${resetUrl}</p>
    <p style="font-size: 16px;">ينتهي هذا الرابط خلال ساعة واحدة.</p>
  `;

  await sendEmail({
    to,
    subject: 'إعادة تعيين كلمة المرور',
    text: `مرحباً،\n\nلقد طلبت إعادة تعيين كلمة المرور. اضغط على الرابط التالي:\n${resetUrl}\n\nإذا لم تطلب ذلك، تجاهل الرسالة.\n\nالرابط صالح لمدة ساعة واحدة.`,
    html: emailWrapper('إعادة تعيين كلمة المرور', content)
  });
};

/**
 * إرسال تنبيه تسجيل الدخول من جهاز جديد
 * @param {string} to عنوان البريد الإلكتروني
 * @param {Object} deviceInfo معلومات الجهاز
 * @param {string} location الموقع (إذا كان متاحاً)
 */
export const sendNewDeviceLoginAlert = async (to, deviceInfo, location = 'غير معروف') => {
  const date = new Date().toLocaleString('ar-SA');
  const content = `
    <p style="font-size: 16px;">مرحباً،</p>
    <p style="font-size: 16px;">تم تسجيل الدخول إلى حسابك من جهاز جديد:</p>
    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p><strong>التاريخ والوقت:</strong> ${date}</p>
      <p><strong>المتصفح:</strong> ${deviceInfo.browser}</p>
      <p><strong>نظام التشغيل:</strong> ${deviceInfo.os}</p>
      <p><strong>الموقع:</strong> ${location}</p>
      <p><strong>عنوان IP:</strong> ${deviceInfo.ip}</p>
    </div>
    <p style="color: #ff0000;">إذا لم تكن أنت من قام بتسجيل الدخول، يرجى تغيير كلمة المرور فوراً.</p>
  `;

  await sendEmail({
    to,
    subject: 'تنبيه: تسجيل دخول من جهاز جديد',
    text: `
مرحباً،

تم تسجيل الدخول إلى حسابك من جهاز جديد:

التاريخ والوقت: ${date}
المتصفح: ${deviceInfo.browser}
نظام التشغيل: ${deviceInfo.os}
الموقع: ${location}
عنوان IP: ${deviceInfo.ip}

إذا لم تقم بهذا الدخول، قم بتغيير كلمة المرور فوراً.
    `,
    html: emailWrapper('تنبيه: تسجيل دخول من جهاز جديد', content)
  });
};

/**
 * إرسال بريد ترحيب للمستخدمين الجدد
 * @param {string} to عنوان البريد الإلكتروني
 * @param {string} firstName اسم المستخدم
 */
export const sendWelcomeEmail = async (to, firstName) => {
  const content = `
    <p style="font-size: 16px;">مرحباً ${firstName}،</p>
    <p style="font-size: 16px;">نحن سعداء جداً بانضمامك إلينا!</p>
    <p style="font-size: 16px;">نود أن نشكرك على اختيارك لنا ونؤكد لك أننا سنبذل قصارى جهدنا لتقديم أفضل خدمة ممكنة.</p>
    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h2 style="color: #333; margin-top: 0;">للبدء، يمكنك:</h2>
      <ul style="list-style-type: none; padding: 0;">
        <li style="margin: 10px 0;">🛍️ تصفح المنتجات المتاحة</li>
        <li style="margin: 10px 0;">💰 إضافة منتجاتك الخاصة للبيع</li>
        <li style="margin: 10px 0;">💬 التواصل مع البائعين والمشترين</li>
        <li style="margin: 10px 0;">👥 متابعة المستخدمين المفضلين لديك</li>
      </ul>
    </div>
    <p style="font-size: 16px;">إذا كنت بحاجة إلى أي مساعدة، لا تتردد في التواصل معنا.</p>
  `;

  await sendEmail({
    to,
    subject: 'مرحباً بك في تطبيقنا سراج!',
    text: `
مرحباً ${firstName}،

نحن سعداء جداً بانضمامك إلينا!

نود أن نشكرك على اختيارك لنا ونؤكد لك أننا سنبذل قصارى جهدنا لتقديم أفضل خدمة ممكنة.

لبداية استخدام التطبيق، يمكنك:
- تصفح المنتجات
- إضافة منتجاتك
- التواصل مع الآخرين
- متابعة مستخدمين آخرين

إذا احتجت لأي مساعدة، لا تتردد في مراسلتنا.

مع تحياتنا،
فريق الدعم
    `,
    html: emailWrapper('مرحباً بك في تطبيقنا! 👋', content)
  });
};


/**
 * إرسال بريد بعد تأكيد الحساب
 * @param {string} to عنوان البريد الإلكتروني
 * @param {string} firstName اسم المستخدم
 */
export const sendAccountVerifiedEmail = async (to, firstName) => {
  const content = `
    <p style="font-size: 16px;">مرحباً ${firstName}،</p>
    <p style="font-size: 16px;">تم تأكيد بريدك الإلكتروني بنجاح ✅</p>
    <p style="font-size: 16px;">أصبح بإمكانك الآن الاستفادة من جميع ميزات التطبيق:</p>
    <ul style="list-style-type: none; padding: 0; margin: 20px 0;">
      <li style="margin: 10px 0;">🔐 تسجيل الدخول بأمان</li>
      <li style="margin: 10px 0;">🛍️ تصفح وشراء وبيع المنتجات</li>
      <li style="margin: 10px 0;">💬 التواصل مع المستخدمين</li>
    </ul>
    <p style="font-size: 16px;">ابدأ رحلتك الآن 👇</p>
    <div style="text-align: center; margin: 20px 0;">
      <a href="${process.env.CLIENT_URL}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-align: center; text-decoration: none; display: inline-block; border-radius: 4px; font-size: 16px;">
        الذهاب إلى التطبيق
      </a>
    </div>
  `;

  await sendEmail({
    to,
    subject: 'تم تأكيد بريدك الإلكتروني 🎉',
    text: `
مرحباً ${firstName}،

تم تأكيد بريدك الإلكتروني بنجاح.

أصبح بإمكانك الآن تسجيل الدخول والتفاعل الكامل مع المنصة.

ابدأ الآن عبر الرابط التالي:
${process.env.CLIENT_URL}

مع تحياتنا،
فريق الدعم
    `,
    html: emailWrapper('تم تأكيد الحساب بنجاح 🎉', content)
  });
};

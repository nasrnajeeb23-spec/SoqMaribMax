import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { motion } from 'framer-motion';
import { useSettings } from '../../hooks/useSettings';

const Footer: React.FC = () => {
  const { settings } = useSettings();
  const { facebook, twitter, instagram, whatsapp } = settings.socialLinks || {};

  return (
    <footer className="bg-sky-900 text-slate-300">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-xl font-bold text-white mb-4">سوق مارب</h3>
            <p className="text-sm text-slate-400">
              أكبر سوق مفتوح في اليمن لعرض السلع والخدمات. نصلك بالبائعين والمشترين في كل مكان.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-slate-100 mb-4">روابط سريعة</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-slate-400 hover:text-white">السلع</Link></li>
              <li><Link to="/services" className="text-slate-400 hover:text-white">الخدمات</Link></li>
              <li><Link to="/community" className="text-slate-400 hover:text-white">المجتمع</Link></li>
              <li><Link to="/advertise" className="text-slate-400 hover:text-white">أعلن معنا</Link></li>
              <li><Link to="/join-delivery" className="text-slate-400 hover:text-white">انضم كمندوب</Link></li>
            </ul>
          </div>

          {/* About Platform */}
           <div>
            <h4 className="font-semibold text-slate-100 mb-4">عن المنصة</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-slate-400 hover:text-white">من نحن</Link></li>
              <li><Link to="/contact" className="text-slate-400 hover:text-white">اتصل بنا</Link></li>
              <li><Link to="/privacy" className="text-slate-400 hover:text-white">سياسة الخصوصية</Link></li>
              <li><Link to="/terms" className="text-slate-400 hover:text-white">شروط الاستخدام</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold text-slate-100 mb-4">تابعنا</h4>
            <div className="flex space-x-4 space-x-reverse">
                {facebook && facebook !== '#' && (
                  <a href={facebook} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path></svg></a>
                )}
                {twitter && twitter !== '#' && (
                  <a href={twitter} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></a ></svg ></a>
                )}
                 {instagram && instagram !== '#' && (
                  <a href={instagram} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.012-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.345 2.525c.636-.247 1.363-.416 2.427-.465C9.792 2.013 10.146 2 12.315 2zm0 1.62c-2.403 0-2.748.01-3.723.056-1.2.053-1.848.22-2.258.385-.486.195-.845.45-1.22.825-.375.375-.63.734-.825 1.22-.165.41-.332 1.058-.385 2.258-.047.975-.056 1.32-.056 3.723s.01 2.748.056 3.723c.053 1.2.22 1.848.385 2.258.195.486.45.845.825 1.22.375.375.734.63 1.22.825.41.165 1.058.332 2.258.385.975.047 1.32.056 3.723.056s2.748-.01 3.723-.056c1.2-.053 1.848-.22 2.258-.385.486-.195.845-.45 1.22-.825.375-.375.63-.734.825-1.22.165-.41.332-1.058.385-2.258.047-.975.056-1.32.056-3.723s-.01-2.748-.056-3.723c-.053-1.2-.22-1.848-.385-2.258-.195-.486-.45-.845-.825-1.22-.375-.375-.734-.63-1.22-.825-.41-.165-1.058-.332-2.258-.385-.975-.047-1.32-.056-3.723-.056zm0 4.685a3.69 3.69 0 100 7.38 3.69 3.69 0 000-7.38zm0 5.76a2.07 2.07 0 110-4.14 2.07 2.07 0 010 4.14zM20.31 5.25a1.25 1.25 0 10-2.5 0 1.25 1.25 0 002.5 0z" clipRule="evenodd"></path></svg></a>
                )}
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-sky-800 pt-6 text-center text-sm text-slate-400">
          <p>&copy; {new Date().getFullYear()} سوق مارب. كل الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
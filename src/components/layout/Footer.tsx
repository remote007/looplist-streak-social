
import { Heart } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t py-6 dark:bg-gray-900 dark:border-gray-800">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-1 mb-4 md:mb-0">
            <span className="font-medium text-gray-700 dark:text-gray-300">© {currentYear} LoopList</span>
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
            <span>Made with</span>
            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
            <span>for better habits</span>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <a href="#" className="text-sm text-gray-500 hover:text-primary dark:text-gray-400">Terms</a>
            <a href="#" className="text-sm text-gray-500 hover:text-primary dark:text-gray-400">Privacy</a>
            <a href="#" className="text-sm text-gray-500 hover:text-primary dark:text-gray-400">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

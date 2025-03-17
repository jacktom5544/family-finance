"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FaHome, 
  FaChartLine, 
  FaMoneyBillWave, 
  FaExchangeAlt, 
  FaPiggyBank, 
  FaRegCreditCard,
  FaCog,
  FaSignOutAlt 
} from 'react-icons/fa';
import { MdMessage } from 'react-icons/md';

const Sidebar = () => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="min-h-screen w-60 bg-gray-900 text-white p-4">
      <div className="flex items-center mb-8">
        <span className="text-2xl font-bold">Cuddle</span>
      </div>

      <div className="mb-8">
        <h3 className="text-xs uppercase font-medium text-gray-400 mb-4">Main Menu</h3>
        <nav>
          <ul className="space-y-2">
            <li>
              <Link href="/" 
                className={`flex items-center p-2 rounded-lg ${isActive('/') ? 'bg-blue-600' : 'hover:bg-gray-800'}`}
              >
                <FaHome className="mr-3" />
                <span>Home</span>
              </Link>
            </li>
            <li>
              <Link href="/pages/expense" 
                className={`flex items-center p-2 rounded-lg ${isActive('/pages/expense') ? 'bg-blue-600' : 'hover:bg-gray-800'}`}
              >
                <FaMoneyBillWave className="mr-3" />
                <span>Expense</span>
              </Link>
            </li>
            <li>
              <Link href="/pages/income" 
                className={`flex items-center p-2 rounded-lg ${isActive('/pages/income') ? 'bg-blue-600' : 'hover:bg-gray-800'}`}
              >
                <FaExchangeAlt className="mr-3" />
                <span>Income</span>
              </Link>
            </li>
            <li>
              <Link href="/pages/saving" 
                className={`flex items-center p-2 rounded-lg ${isActive('/pages/saving') ? 'bg-blue-600' : 'hover:bg-gray-800'}`}
              >
                <FaPiggyBank className="mr-3" />
                <span>Saving</span>
              </Link>
            </li>
            <li>
              <Link href="/pages/prediction" 
                className={`flex items-center p-2 rounded-lg ${isActive('/pages/prediction') ? 'bg-blue-600' : 'hover:bg-gray-800'}`}
              >
                <FaChartLine className="mr-3" />
                <span>Prediction</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="mb-8">
        <h3 className="text-xs uppercase font-medium text-gray-400 mb-4">Account Management</h3>
        <nav>
          <ul className="space-y-2">
            <li>
              <Link href="/account" 
                className="flex items-center p-2 rounded-lg hover:bg-gray-800"
              >
                <FaCog className="mr-3" />
                <span>Settings</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="mt-auto">
        <Link href="/logout" 
          className="flex items-center p-2 rounded-lg hover:bg-gray-800"
        >
          <FaSignOutAlt className="mr-3" />
          <span>Log out</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar; 
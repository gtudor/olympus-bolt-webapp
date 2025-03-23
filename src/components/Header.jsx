import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHdd, faUserCircle, faSearch } from '@fortawesome/free-solid-svg-icons';

function Header() {
  return (
    <div className="bg-white px-5 py-2.5 flex items-center border-b border-gray-200">
      <div className="flex items-center text-blue-500 text-xl mr-12">
        <FontAwesomeIcon icon={faHdd} className="mr-2" />
        <span>Drive</span>
      </div>
      <div className="flex-1 max-w-3xl">
        <div className="bg-gray-100 rounded-lg px-4 py-2 flex items-center">
          <input
            type="text"
            placeholder="Search in Drive"
            className="bg-transparent border-none outline-none w-full text-base"
          />
          <FontAwesomeIcon icon={faSearch} className="text-gray-500" />
        </div>
      </div>
      <div className="ml-auto text-2xl text-gray-600">
        <FontAwesomeIcon icon={faUserCircle} />
      </div>
    </div>
  );
}

export default Header;

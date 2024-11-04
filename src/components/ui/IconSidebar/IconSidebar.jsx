import {FilterIcon} from "../Icons/FilterIcon"
import {SearchIcon} from "../Icons/SearchIcon.tsx"
import "./IconSidebar.css"

export const IconSidebar = () => {
  return (
    <div className="icon-sidebar">
      <button><FilterIcon/></button>
      <button><SearchIcon/></button>
    </div>
  )
}
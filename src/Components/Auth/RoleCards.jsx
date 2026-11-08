import { FiCheck, FiShield, FiShoppingBag, FiUser } from "react-icons/fi";
import { FaMotorcycle } from "react-icons/fa";

const icons = { customer: FiShoppingBag, rider: FaMotorcycle, admin: FiShield };

// Role picker. Roles, labels and descriptions all come from the database.
const RoleCards = ({ roles, value, onChange, disabled = false }) => (
  <div role="radiogroup" aria-label="Choose your role" className="grid gap-3 sm:grid-cols-2">
    {roles.map((role) => {
      const Icon = icons[role.icon] || FiUser;
      return (
        <label key={role.key} className="role-card">
          <input
            type="radio"
            name="role"
            value={role.key}
            checked={value === role.key}
            onChange={() => onChange(role.key)}
            disabled={disabled}
            className="sr-only"
          />
          <span className="role-card__icon">
            <Icon size={20} aria-hidden="true" />
          </span>
          <span className="min-w-0 pr-6">
            <span className="block font-semibold">{role.label}</span>
            <span className="mt-0.5 block text-sm leading-snug text-base-content/70">
              {role.description}
            </span>
          </span>
          <span className="role-card__check" aria-hidden="true">
            <FiCheck size={14} />
          </span>
        </label>
      );
    })}
  </div>
);

export default RoleCards;

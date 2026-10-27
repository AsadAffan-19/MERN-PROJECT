import { initials } from '../utils';

export default function Avatar({ name, large }) {
  return <span className={`avatar ${large ? 'large' : ''}`}>{initials(name)}</span>;
}

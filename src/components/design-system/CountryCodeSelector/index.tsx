import countryData from "./countries.json";

export interface CountryCodeSelectorProps {
  name?: string;
  className?: string;
  style?: { [key: string]: string };
}

const CountryCodeSelector = ({ name, className, style }: CountryCodeSelectorProps) => {
  return (
    <select name={name} className={`text-slate-900 ${className}`} style={style}>
      {countryData.map(({ countryCode, countryName }) => (
        <option key={countryName} value={countryCode}>
          +{countryCode}
        </option>
      ))}
    </select>
  );
};

export default CountryCodeSelector;

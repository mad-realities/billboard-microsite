interface SelectFieldProps {
  options: string[];
  setOption: (opt: string) => void;
  id?: string;
}

export default function SelectField({ options, setOption, id }: SelectFieldProps) {
  return (
    <div>
      <select id={id} onChange={(e) => setOption(e.target.value)}>
        <option disabled selected value="" key="0">
          Select an Option
        </option>
        {options.map((opt) => (
          <option value={opt} key={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

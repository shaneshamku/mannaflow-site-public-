type SectionNotchProps = {
  /** Background color of the section above — fills the downward tab */
  from: string;
};

export default function SectionNotch({ from }: SectionNotchProps) {
  return (
    <div aria-hidden className="section-notch">
      <span
        className="notch-tip"
        style={{ "--notch-from": from } as React.CSSProperties}
      />
    </div>
  );
}

import { translationAtom } from "@/atoms/translations-atom";
import { reduceAnimationsAtom } from "@/atoms/user-settings-atom";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { useAtom, useAtomValue } from "jotai";

const ReduceAnimationsToggle = () => {
  const [reduceAnimations, setReduceAnimations] = useAtom(reduceAnimationsAtom);
  const t = useAtomValue(translationAtom);

  return (
    <Field orientation="horizontal">
      <FieldContent>
        <FieldLabel htmlFor="reduce-animations-switch">
          {t`REDUCE ANIMATIONS`}
        </FieldLabel>
        <FieldDescription>
          {t`If enabled, icons stay still instead of animating.`}
        </FieldDescription>
      </FieldContent>
      <Switch
        id="reduce-animations-switch"
        checked={reduceAnimations}
        onCheckedChange={setReduceAnimations}
      />
    </Field>
  );
};

export default ReduceAnimationsToggle;

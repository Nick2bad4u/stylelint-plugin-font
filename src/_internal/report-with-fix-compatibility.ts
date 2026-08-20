import stylelint, { type RuleContext } from "stylelint";
import { isDefined, objectHasOwn } from "ts-extras";

const report: typeof stylelint.utils.report = stylelint.utils.report;

type FixableProblem = Parameters<typeof report>[0] &
    Readonly<{ fix: () => void }>;

/**
 * Report an autofixable problem across the complete supported Stylelint range.
 *
 * Stylelint 16.0 predates the `report({ fix })` callback. Its rule context has
 * an own data property named `fix`, whereas current Stylelint exposes a getter
 * that emits a deprecation warning when read. Inspecting the descriptor lets us
 * use the legacy mutation path only when necessary, without touching the
 * deprecated getter on current runtimes.
 */
export function reportWithFixCompatibility(
    problem: FixableProblem,
    context: RuleContext
): void {
    const fixDescriptor = Object.getOwnPropertyDescriptor(context, "fix");
    const isLegacyFixEnabled =
        isDefined(fixDescriptor) &&
        objectHasOwn(fixDescriptor, "value") &&
        Reflect.get(fixDescriptor, "value") === true;

    if (isLegacyFixEnabled) {
        problem.fix();
        return;
    }

    report(problem);
}

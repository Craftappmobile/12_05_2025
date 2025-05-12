import * as React from "react";
import { Text as RNText, Platform } from "react-native";

import * as Slot from "../primitives/slot";
import { SlottableTextProps, TextRef } from "../primitives/types";

import { cn } from "@/lib/utils";

const TextClassContext = React.createContext<string | undefined>(undefined);

// Визначаємо базовий шрифт для різних платформ
const getDefaultFontFamily = () => {
  if (Platform.OS === 'android') {
    return 'Roboto'; // Використовуємо Roboto для Android
  } else if (Platform.OS === 'ios') {
    return 'System'; // Використовуємо системний шрифт для iOS
  }
  return undefined;
};

const Text = React.forwardRef<TextRef, SlottableTextProps>(
	({ className, asChild = false, style, ...props }, ref) => {
		const textClass = React.useContext(TextClassContext);
		const Component = asChild ? Slot.Text : RNText;
		
		// Додаємо шрифт до стилю, якщо він не визначений
		const fontFamily = getDefaultFontFamily();
		const combinedStyle = [
		  style,
		  fontFamily ? { fontFamily } : null
		];
		
		return (
			<Component
				className={cn(
					"text-base text-foreground web:select-text",
					textClass,
					className,
				)}
				style={combinedStyle}
				ref={ref}
				{...props}
			/>
		);
	},
);
Text.displayName = "Text";

export { Text, TextClassContext };

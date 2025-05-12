import * as React from "react";
import { TextInput, Platform, StyleSheet } from "react-native";

import { cn } from "@/lib/utils";

// Визначаємо базовий шрифт для різних платформ
const getDefaultFontFamily = () => {
  if (Platform.OS === 'android') {
    return 'Roboto'; // Використовуємо Roboto для Android
  } else if (Platform.OS === 'ios') {
    return 'System'; // Використовуємо системний шрифт для iOS
  }
  return undefined;
};

const Input = React.forwardRef<
	React.ElementRef<typeof TextInput>,
	React.ComponentPropsWithoutRef<typeof TextInput>
>(({ className, placeholderClassName, style, ...props }, ref) => {
	// Додаємо шрифт до стилю
	const fontFamily = getDefaultFontFamily();
	const combinedStyle = [
	  style,
	  fontFamily ? { fontFamily } : null,
	  styles.input
	];
	
	return (
		<TextInput
			ref={ref}
			className={cn(
				"web:flex h-10 native:h-12 web:w-full rounded-md border border-input bg-background px-3 web:py-2 text-base lg:text-sm native:text-lg native:leading-[1.25] text-foreground placeholder:text-muted-foreground web:ring-offset-background file:border-0 file:bg-transparent file:font-medium web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2",
				props.editable === false && "opacity-50 web:cursor-not-allowed",
				className,
			)}
			placeholderClassName={cn("text-muted-foreground", placeholderClassName)}
			style={combinedStyle}
			{...props}
		/>
	);
});

const styles = StyleSheet.create({
  input: {
    // Додаткові стилі для вирішення проблем з кодуванням
    includeFontPadding: false,
    textAlignVertical: 'center',
  }
});

Input.displayName = "Input";

export { Input };

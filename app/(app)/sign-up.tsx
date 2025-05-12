import { View, Text } from 'react-native';  
import { SafeAreaView } from '@/components/safe-area-view';  
import { Button } from '@/components/ui/button';  
import { Link } from 'expo-router';  
  
export default function SignUp() {  
  return (  
    <SafeAreaView className="flex-1 bg-background p-4">  
      <View className="flex-1 justify-center">  
        <Text className="text-3xl font-bold text-primary mb-8 text-center">Реєстрац?я</Text>  
        <Button className="mt-4"><Text>Зареєструватися</Text></Button>  
        <View className="flex-row justify-center mt-4">  
          <Text className="text-muted-foreground">Вже маєте обл?ковий запис? </Text>  
          <Link href="/(app)/sign-in" asChild>  
            <Text className="text-primary font-medium">Ув?йти</Text>  
          </Link>  
        </View>  
      </View>  
    </SafeAreaView>  
  );  
} 

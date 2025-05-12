import { View, Text } from 'react-native';  
import { SafeAreaView } from '@/components/safe-area-view';  
  
export default function Settings() {  
  return (  
    <SafeAreaView className="flex-1 bg-background p-4">  
      <View>  
        <Text className="text-2xl font-bold text-primary">Налаштування</Text>  
      </View>  
    </SafeAreaView>  
  );  
} 

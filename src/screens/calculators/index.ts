import { createSafeNavigationComponent } from '../../utils/enhanceComponents';

// Імпортуємо оригінальні компоненти
import YarnCalculatorBase from './YarnCalculator';
import YarnCalculatorWithNavigationBase from './YarnCalculatorWithNavigation';
import HomeScreenBase from './HomeScreen';
import FavoritesScreenBase from './FavoritesScreen';
import SearchScreenBase from './SearchScreen';
import NotificationsScreenBase from './NotificationsScreen';
import HatCalculatorBase from './HatCalculator';
import VNeckDecreaseCalculatorBase from './VNeckDecreaseCalculator';
import AdaptationCalculatorBase from './AdaptationCalculator';
import SaveCalculationModalBase from './SaveCalculationModal';

// Встановлюємо displayName для всіх компонентів
YarnCalculatorBase.displayName = "YarnCalculator";
YarnCalculatorWithNavigationBase.displayName = "YarnCalculatorWithNavigation";
HomeScreenBase.displayName = "HomeScreen";
FavoritesScreenBase.displayName = "FavoritesScreen";
SearchScreenBase.displayName = "SearchScreen";
NotificationsScreenBase.displayName = "NotificationsScreen";
HatCalculatorBase.displayName = "HatCalculator";
VNeckDecreaseCalculatorBase.displayName = "VNeckDecreaseCalculator";
AdaptationCalculatorBase.displayName = "AdaptationCalculator";
SaveCalculationModalBase.displayName = "SaveCalculationModal";

// Створюємо безпечні версії компонентів з класовими обгортками
export const YarnCalculator = createSafeNavigationComponent(YarnCalculatorBase, "YarnCalculator");
export const YarnCalculatorWithNavigation = createSafeNavigationComponent(YarnCalculatorWithNavigationBase, "YarnCalculatorWithNavigation");
export const HomeScreen = createSafeNavigationComponent(HomeScreenBase, "HomeScreen");
export const FavoritesScreen = createSafeNavigationComponent(FavoritesScreenBase, "FavoritesScreen");
export const SearchScreen = createSafeNavigationComponent(SearchScreenBase, "SearchScreen");
export const NotificationsScreen = createSafeNavigationComponent(NotificationsScreenBase, "NotificationsScreen");
export const HatCalculator = createSafeNavigationComponent(HatCalculatorBase, "HatCalculator");
export const VNeckDecreaseCalculator = createSafeNavigationComponent(VNeckDecreaseCalculatorBase, "VNeckDecreaseCalculator");
export const AdaptationCalculator = createSafeNavigationComponent(AdaptationCalculatorBase, "AdaptationCalculator");
export const SaveCalculationModal = createSafeNavigationComponent(SaveCalculationModalBase, "SaveCalculationModal");

import { Level } from '../types/game';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Sword, Shield, Crown, Skull, Flame, Snowflake } from 'lucide-react';

interface LevelSelectProps {
  levels: Level[];
  completedLevels: number[];
  currentLevel: number;
  onSelectLevel: (levelId: number) => void;
  onResetProgress: () => void;
}

const getThemeIcon = (theme: Level['backgroundTheme']) => {
  switch (theme) {
    case 'castle':
      return <Crown className="w-4 h-4" />;
    case 'dungeon':
      return <Skull className="w-4 h-4" />;
    case 'forest':
      return <Sword className="w-4 h-4" />;
    case 'hell':
      return <Flame className="w-4 h-4" />;
    case 'ice':
      return <Snowflake className="w-4 h-4" />;
    case 'desert':
      return <Shield className="w-4 h-4" />;
    default:
      return <Sword className="w-4 h-4" />;
  }
};

const getThemeColor = (theme: Level['backgroundTheme']) => {
  switch (theme) {
    case 'castle':
      return 'from-gray-700 to-gray-900';
    case 'dungeon':
      return 'from-stone-700 to-stone-900';
    case 'forest':
      return 'from-green-700 to-green-900';
    case 'hell':
      return 'from-red-700 to-red-900';
    case 'ice':
      return 'from-blue-700 to-blue-900';
    case 'desert':
      return 'from-yellow-700 to-yellow-900';
    default:
      return 'from-gray-700 to-gray-900';
  }
};

const getDifficultyColor = (level: Level) => {
  const difficulty = level.enemyHealthMultiplier + level.enemyStaminaMultiplier + level.enemySpeedMultiplier;
  if (difficulty < 2.5) return 'bg-green-600';
  if (difficulty < 3.5) return 'bg-yellow-600';
  if (difficulty < 4.5) return 'bg-orange-600';
  return 'bg-red-600';
};

const getDifficultyText = (level: Level) => {
  const difficulty = level.enemyHealthMultiplier + level.enemyStaminaMultiplier + level.enemySpeedMultiplier;
  if (difficulty < 2.5) return 'Easy';
  if (difficulty < 3.5) return 'Medium';
  if (difficulty < 4.5) return 'Hard';
  return 'Extreme';
};

export default function LevelSelect({
  levels,
  completedLevels,
  currentLevel,
  onSelectLevel,
  onResetProgress,
}: LevelSelectProps) {
  const isLevelUnlocked = (levelId: number) => {
    if (levelId === 1) return true;
    return completedLevels.includes(levelId - 1);
  };

  const getProgressPercentage = () => {
    return Math.round((completedLevels.length / levels.length) * 100);
  };

  return (
    <div className="w-full h-full bg-gradient-to-b from-gray-900 to-black p-8 overflow-hidden">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-cinzel-decorative text-5xl md:text-7xl text-secondary mb-4 drop-shadow-2xl">
          CHOOSE YOUR BATTLE
        </h1>
        <p className="font-cinzel text-xl text-muted-foreground mb-4">
          Progress through 18 deadly levels of medieval combat
        </p>
        
        {/* Progress Bar */}
        <div className="max-w-md mx-auto mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-cinzel text-muted-foreground">Progress</span>
            <span className="text-sm font-cinzel text-secondary">{completedLevels.length}/{levels.length}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-red-600 to-red-800 h-3 rounded-full transition-all duration-500"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">{getProgressPercentage()}% Complete</p>
        </div>

        <div className="flex gap-4 justify-center">
          <Button
            onClick={onResetProgress}
            variant="outline"
            className="font-cinzel border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
          >
            Reset Progress
          </Button>
        </div>
      </div>

      {/* Level Grid */}
      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {levels.map((level) => {
            const isCompleted = completedLevels.includes(level.id);
            const isUnlocked = isLevelUnlocked(level.id);
            const isCurrent = level.id === currentLevel;

            return (
              <Card
                key={level.id}
                className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
                  isUnlocked
                    ? 'cursor-pointer border-gray-600 hover:border-red-500'
                    : 'cursor-not-allowed border-gray-800 opacity-50'
                } ${isCurrent ? 'ring-2 ring-red-500' : ''}`}
                onClick={() => isUnlocked && onSelectLevel(level.id)}
              >
                {/* Background Theme */}
                <div className={`absolute inset-0 bg-gradient-to-br ${getThemeColor(level.backgroundTheme)} opacity-20`} />
                
                {/* Level Number Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <Badge 
                    variant={isCompleted ? "default" : "secondary"}
                    className={`text-lg px-3 py-1 ${
                      isCompleted 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : isUnlocked 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-gray-600'
                    }`}
                  >
                    {level.id}
                  </Badge>
                </div>

                {/* Completion Status */}
                {isCompleted && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-green-600 hover:bg-green-700">
                      ✓ Complete
                    </Badge>
                  </div>
                )}

                {/* Lock Icon for Locked Levels */}
                {!isUnlocked && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="bg-black/80 rounded-full p-4">
                      <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}

                <CardHeader className="relative z-5">
                  <div className="flex items-center gap-2 mb-2">
                    {getThemeIcon(level.backgroundTheme)}
                    <CardTitle className="font-cinzel text-lg text-white">
                      {level.name}
                    </CardTitle>
                  </div>
                  <CardDescription className="font-cinzel text-sm text-gray-300 line-clamp-2">
                    {level.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative z-5">
                  <div className="space-y-3">
                    {/* Enemy Info */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-cinzel text-gray-400">Enemy:</span>
                      <span className="text-sm font-cinzel text-white">{level.enemyName}</span>
                    </div>

                    {/* Weapon & Armor */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-cinzel text-gray-400">Weapon:</span>
                      <span className="text-sm font-cinzel text-white capitalize">{level.enemyWeapon}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-cinzel text-gray-400">Armor:</span>
                      <span className="text-sm font-cinzel text-white capitalize">{level.enemyArmor}</span>
                    </div>

                    {/* Difficulty */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-cinzel text-gray-400">Difficulty:</span>
                      <Badge className={`${getDifficultyColor(level)} text-white`}>
                        {getDifficultyText(level)}
                      </Badge>
                    </div>

                    {/* Rewards */}
                    {(level.rewardWeapon || level.rewardArmor) && (
                      <div className="pt-2 border-t border-gray-700">
                        <p className="text-xs font-cinzel text-gray-400 mb-1">Rewards:</p>
                        <div className="flex gap-1 flex-wrap">
                          {level.rewardWeapon && (
                            <Badge variant="outline" className="text-xs border-yellow-600 text-yellow-400">
                              {level.rewardWeapon}
                            </Badge>
                          )}
                          {level.rewardArmor && (
                            <Badge variant="outline" className="text-xs border-blue-600 text-blue-400">
                              {level.rewardArmor}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Special Effects */}
                    {level.specialEffects && level.specialEffects.length > 0 && (
                      <div className="pt-2 border-t border-gray-700">
                        <p className="text-xs font-cinzel text-gray-400 mb-1">Special Effects:</p>
                        <div className="flex gap-1 flex-wrap">
                          {level.specialEffects.map((effect, index) => (
                            <Badge key={index} variant="outline" className="text-xs border-purple-600 text-purple-400">
                              {effect.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  {isUnlocked && (
                    <Button
                      className="w-full mt-4 font-cinzel bg-red-600 hover:bg-red-700 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectLevel(level.id);
                      }}
                    >
                      {isCompleted ? 'Fight Again' : 'Enter Battle'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
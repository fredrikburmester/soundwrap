import { useRef, useEffect } from "react"
import LottieView from 'lottie-react-native'
import { Animated, Easing } from "react-native"

type Props = {
  animationData: any
  onAnimationFinish: () => void
}

export const LottieAnimation: React.FC<Props> = ({ animationData, onAnimationFinish, ...props }) => {
  const animation = useRef(null)
  const fadeAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    // @ts-ignore
    animation.current.play()
  }, [animationData])

  // useEffect(() => {
  //   Animated.timing(fadeAnim, {
  //     toValue: 1,
  //     duration: 1000,
  //     easing: Easing.linear,
  //     useNativeDriver: true,
  //   }).start()
  // }, [fadeAnim])

  const animationFinish = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(onAnimationFinish)
  }

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
      }}
    >

      <LottieView
        loop={false}
        ref={animation}
        style={{
          width: 200,
          height: 200,
          backgroundColor: 'transparent',
          alignSelf: 'center',
          marginBottom: 100,
        }}
        onAnimationFinish={animationFinish}
        duration={1000}
        source={animationData}
      />
    </Animated.View>
  )
}
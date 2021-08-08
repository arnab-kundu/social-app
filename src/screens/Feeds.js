import React, { useEffect } from 'react'
import { Animated, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Colors from '../constants/Colors'
import { Surface } from 'react-native-paper'
import Icons, { icons } from '../components/Icons'
import MyHeader from '../components/MyHeader'
import { useRef } from 'react'
import { useState } from 'react'
import { data } from '../constants/row'

const tabIcons = [
  { ico1: "home", ico2: "home-outline", type: icons.Ionicons },
  { ico1: 'like1', ico2: 'like2', type: icons.AntDesign },
  { ico1: "plus", ico2: "plus", type: icons.Entypo },
  { ico1: "chatbox-ellipses", ico2: 'chatbox-ellipses-outline', type: icons.Ionicons },
  { ico1: 'user', ico2: 'user-o', type: icons.FontAwesome },
]

const RenderItem = ({ item }) => {
  return (
    <Surface style={styles.item}>
      <View style={styles.content}>
        <Image style={styles.avatar} source={{ uri: item.avatar }} resizeMode="cover" />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.caption}>{item.caption}</Text>
        </View>
        <View style={{ position: 'absolute', top: 16, right: 0 }}>
          <Icons icon={icons.Entypo} name="dots-three-vertical" size={18} />
        </View>
      </View>
      <Image style={styles.image} source={{ uri: item.image }} resizeMode="cover" />
      <View style={styles.bottomView}>
        <View style={styles.icon}>
          <Icons icon={icons.AntDesign} name="heart" color={Colors.primary} />
        </View>
        <View style={styles.icon}>
          <Icons icon={icons.Ionicons} name="chatbubble-outline" />
        </View>
        <View style={styles.icon}>
          <Icons icon={icons.Feather} name="send" />
        </View>
      </View>
    </Surface>
  )
}

const CONTAINER_HEIGHT = 50;
const Feeds = ({ route }) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const offsetAnim = useRef(new Animated.Value(0)).current;
  const [focused, setFocused] = useState('home');
  const clampedScroll = Animated.diffClamp(
    Animated.add(
      scrollY.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
        extrapolateLeft: 'clamp',
      }),
      offsetAnim,
    ),
    0,
    CONTAINER_HEIGHT
  )
  var _clampedScrollValue = 0;
  var _offsetValue = 0;
  var _scrollValue = 0;
  useEffect(() => {
    scrollY.addListener(({ value }) => {
      const diff = value - _scrollValue;
      _scrollValue = value;
      _clampedScrollValue = Math.min(
        Math.max(_clampedScrollValue + diff, 0),
        CONTAINER_HEIGHT,
      )
    });
    offsetAnim.addListener(({ value }) => {
      _offsetValue = value;
    })
  }, []);

  var scrollEndTimer = null;
  const onMomentumScrollBegin = () => {
    clearTimeout(scrollEndTimer)
  }
  const onMomentumScrollEnd = () => {
    const toValue = _scrollValue > CONTAINER_HEIGHT &&
      _clampedScrollValue > (CONTAINER_HEIGHT) / 2
      ? _offsetValue + CONTAINER_HEIGHT : _offsetValue - CONTAINER_HEIGHT;

    Animated.timing(offsetAnim, {
      toValue,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }
  const onScrollEndDrag = () => {
    scrollEndTimer = setTimeout(onMomentumScrollEnd, 250);
  }

  const headerTranslate = clampedScroll.interpolate({
    inputRange: [0, CONTAINER_HEIGHT],
    outputRange: [0, -CONTAINER_HEIGHT],
    extrapolate: 'clamp',
  })
  const opacity = clampedScroll.interpolate({
    inputRange: [0, CONTAINER_HEIGHT - 20, CONTAINER_HEIGHT],
    outputRange: [1, 0.05, 0],
    extrapolate: 'clamp',
  })
  const bottomTabTranslate = clampedScroll.interpolate({
    inputRange: [0, CONTAINER_HEIGHT],
    outputRange: [0, CONTAINER_HEIGHT * 2],
    extrapolate: 'clamp',
  })

  return (
    <View style={styles.container}>
      <Animated.FlatList
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        data={data}
        keyExtractor={(item, index) => item.title + index.toString()}
        renderItem={RenderItem}
        contentContainerStyle={styles.contantContainerStyle}
        onMomentumScrollBegin={onMomentumScrollBegin}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollEndDrag={onScrollEndDrag}
        scrollEventThrottle={1}
      />
      <Animated.View style={[styles.view, { top: 0, transform: [{ translateY: headerTranslate }] }]}>
        <MyHeader
          menu
          title={route.name}
          right="search"
          style={[styles.header, {opacity}]}
        />
      </Animated.View>
      <Animated.View style={[styles.view, { bottom: 0, transform: [{ translateY: bottomTabTranslate }] }]}>
        <Surface style={[styles.rowContainer, styles.bottomBar]}>
          {tabIcons.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[index === 2 && styles.plusIconStyle]}>
              <Icons icon={item.type} name={focused === item.ico1 ? item.ico1 : item.ico2}
                color={index === 2 && Colors.white}
                size={index === 2 && 34}
              />
            </TouchableOpacity>
          ))}
        </Surface>
      </Animated.View>
    </View>
  )
}

export default Feeds

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  view: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: CONTAINER_HEIGHT,
  },
  header: {
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 16,
    marginHorizontal: 4,
  },
  bottomBar: {
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    marginHorizontal: 4,
  },
  contantContainerStyle: {
    paddingTop: CONTAINER_HEIGHT,
    marginTop: 8,
  },
  rowContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  item: {
    marginHorizontal: 10,
    marginBottom: 12,
    elevation: 6,
    borderRadius: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  caption: {
    color: Colors.darkGray,
  },
  image: {
    height: 300,
    width: null,
    marginBottom: 1,
    marginHorizontal: 16,
    borderRadius: 16,
  },
  bottomView: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: 16
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    marginHorizontal: 16,
    paddingVertical: 8,
  },
  textContainer: {
    marginHorizontal: 16,
  },
  avatar: {
    height: 35,
    width: 35,
    borderRadius: 20,
    backgroundColor: Colors.primary,
  },
  rowView: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  icon: {
    marginHorizontal: 10,
  },
  plusIconStyle: {
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'black',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.6,
    elevation: 8,
    borderWidth: 4,
    borderColor: Colors.white,
  },
})
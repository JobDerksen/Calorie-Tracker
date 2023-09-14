/* eslint-disable prettier/prettier,no-trailing-spaces,react-hooks/exhaustive-deps */
/*
Author - Job Derksen
Date created - 19/08/2022
*/
import React from 'react';
import {Animated, Dimensions, Modal, StyleSheet, View} from 'react-native';

const ModalPopup = ({visible, style, children})=>{
    const [showModal, setShowModal] = React.useState(visible);
    const scaleValue = React.useRef(new Animated.Value(0)).current;
    React.useEffect(() => {
            toggleModal();
        },
        [visible]);

    const toggleModal = ()=>{
        if (visible){
            setShowModal(true);
            Animated.timing(scaleValue,{
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            setTimeout(() => setShowModal(false), 200);
            Animated.timing(scaleValue, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    };
    if (style === 'newFood') {
        return (
            <Modal transparent visible={showModal}>
                <View style={popup.modalBackGround}>
                    <Animated.View
                        style={[popup.modalContainer, {transform: [{scale: scaleValue}]}]}>
                        {children}
                    </Animated.View>
                </View>
            </Modal>
        );
    } else if (style === 'YN') {
        return (
            <Modal transparent visible={showModal}>
                <View style={popup.modalBackGroundYN}>
                    <Animated.View
                        style={[popup.modalContainerYN, {transform: [{scale: scaleValue}]}]}>
                        {children}
                    </Animated.View>
                </View>
            </Modal>
        );
    }  else if (style === 'addFood') {
        return (
            <Modal transparent visible={showModal}>
                <View style={popup.modalBackGround}>
                    <Animated.View
                        style={[popup.modalContainerAdd, {transform: [{scale: scaleValue}]}]}>
                        {children}
                    </Animated.View>
                </View>
            </Modal>
        );
    }

};

const popup = StyleSheet.create({
    modalBackGround:{
        flex: 1,
        backgroundColor:'rgba(0,0,0,0.5)',
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
        alignItems:'center',
        justifyContent:'flex-start',
        paddingTop: Dimensions.get('window').height * 0.07,
    },
    modalBackGroundYN:{
        flex: 1,
        backgroundColor:'rgba(0,0,0,0.5)',
        alignItems:'center',
        justifyContent:'center',
    },
    modalContainer:{
        width: Dimensions.get('window').width * 0.95,
        height: Dimensions.get('window').height * 0.80,
        backgroundColor:'#575757',
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderRadius: 8,
        elevation: 20,
    },
    modalContainerYN:{
        width: Dimensions.get('window').width * 0.5,
        height: Dimensions.get('window').height * 0.15,
        backgroundColor:'#575757',
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderRadius: 8,
        elevation: 20,
    },

    modalContainerAdd:{
        width: Dimensions.get('window').width * 0.95,
        height: Dimensions.get('window').height * 0.60,
        backgroundColor:'#575757',
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderRadius: 8,
        elevation: 20,
    },
});

export default ModalPopup;

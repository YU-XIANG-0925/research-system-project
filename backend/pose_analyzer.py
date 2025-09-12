import cv2
import mediapipe as mp
import numpy as np
import math

mp_pose = mp.solutions.pose

def calculate_angles_from_java_logic(landmarks):
    """
    參照 PoseGraphic_Active_Questioning.java 的邏輯計算手臂角度。
    這種方法是計算關節在特定 2D 平面上的投影角度。
    """
    p = mp_pose.PoseLandmark

    # 獲取所需關節點的 3D 座標
    left_shoulder = landmarks[p.LEFT_SHOULDER.value]
    right_shoulder = landmarks[p.RIGHT_SHOULDER.value]
    left_elbow = landmarks[p.LEFT_ELBOW.value]
    right_elbow = landmarks[p.RIGHT_ELBOW.value]
    left_wrist = landmarks[p.LEFT_WRIST.value]
    right_wrist = landmarks[p.RIGHT_WRIST.value]

    angles = {}

    # --- 左手臂角度計算 ---
    # 手臂與身體側邊在 XY 平面的夾角 (angleX)
    angles['angleXLeftSE'] = math.degrees(math.atan2(
        abs(left_shoulder.x - left_elbow.x), abs(left_shoulder.y - left_elbow.y)
    ))
    # 手臂與身體側邊在 ZY 平面的夾角 (angleZ)
    angles['angleZLeftSE'] = math.degrees(math.atan2(
        abs(left_shoulder.y - left_elbow.y), abs(left_shoulder.z - left_elbow.z)
    ))
    # 手臂與身體正面在 XZ 平面的夾角 (angleY)
    angles['angleYLeftSW'] = math.degrees(math.atan2(
        abs(left_shoulder.z - left_wrist.z), abs(left_shoulder.x - left_wrist.x)
    ))

    # --- 右手臂角度計算 ---
    angles['angleXRightSE'] = math.degrees(math.atan2(
        abs(right_shoulder.x - right_elbow.x), abs(right_shoulder.y - right_elbow.y)
    ))
    angles['angleZRightSE'] = math.degrees(math.atan2(
        abs(right_shoulder.y - right_elbow.y), abs(right_shoulder.z - right_elbow.z)
    ))
    angles['angleYRightSW'] = math.degrees(math.atan2(
        abs(right_shoulder.z - right_wrist.z), abs(right_shoulder.x - right_wrist.x)
    ))

    return angles

def convert_to_robot_motors(human_angles):
    """
    參照 Active_Questioning.java 的 ctlMotor 邏輯，將人體角度轉換為機器人馬達角度。
    注意：這是一個直接的邏輯移植，實際機器人的反應可能需要微調。
    """
    motor_angles = {}

    # --- 左手臂馬達角度轉換 ---
    motor_angles['MOTOR_LEFT_SHOULDER_Z'] = -human_angles.get('angleZLeftSE', 0)
    motor_angles['MOTOR_LEFT_SHOULDER_Y'] = -(170 - human_angles.get('angleYLeftSW', 0))
    motor_angles['MOTOR_LEFT_SHOULDER_X'] = -human_angles.get('angleXLeftSE', 0)
    motor_angles['MOTOR_LEFT_ELBOW_Y'] = 0.0  # Java 程式碼中直接設為 0

    # --- 右手臂馬達角度轉換 ---
    motor_angles['MOTOR_RIGHT_SHOULDER_Z'] = -human_angles.get('angleZRightSE', 0)
    motor_angles['MOTOR_RIGHT_SHOULDER_Y'] = -(170 - human_angles.get('angleYRightSW', 0))
    motor_angles['MOTOR_RIGHT_SHOULDER_X'] = -human_angles.get('angleXRightSE', 0)
    motor_angles['MOTOR_RIGHT_ELBOW_Y'] = 0.0 # Java 程式碼中直接設為 0
    
    return motor_angles

def get_landmark_coords(landmarks, landmark_name):
    """輔助函式：提取特定關節點的 3D 座標"""
    try:
        lm = landmarks[mp_pose.PoseLandmark[landmark_name].value]
        return [lm.x, lm.y, lm.z]
    except (KeyError, IndexError):
        return None

def analyze_video_from_path(video_path: str):
    """
    分析指定的影片檔案，提取每一幀的關節點、人體角度和機器人馬達角度。

    :param video_path: 影片檔案的路徑
    :return: 一個包含所有幀數據的列表
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"Error: 無法開啟影片檔案 {video_path}")
        return None

    all_frames_data = []
    frame_count = 0

    with mp_pose.Pose(
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5,
        model_complexity=1,
        static_image_mode=False
    ) as pose:
        while cap.isOpened():
            success, image = cap.read()
            if not success:
                break

            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = pose.process(image_rgb)

            frame_data = {"frame": frame_count, "landmarks": {}, "human_angles": {}, "robot_motor_angles": {}}
            
            if results.pose_world_landmarks:
                landmarks_3d = results.pose_world_landmarks.landmark
                
                human_angles = calculate_angles_from_java_logic(landmarks_3d)
                frame_data['human_angles'] = human_angles

                robot_motor_angles = convert_to_robot_motors(human_angles)
                frame_data['robot_motor_angles'] = robot_motor_angles
                
                for landmark_name in mp_pose.PoseLandmark.__members__:
                    frame_data["landmarks"][landmark_name] = get_landmark_coords(landmarks_3d, landmark_name)

            all_frames_data.append(frame_data)
            frame_count += 1
    
    cap.release()
    print(f"影片 {video_path} 處理完成，共 {frame_count} 幀。")
    return all_frames_data

import * as THREE from "three";
import { Quaternion } from "three";
import Log from "./log/Log";
import { getOrDefault } from "./log/LogUtil";
import LoggableType from "./log/LoggableType";

export type Translation2d = [number, number]; // meters (x, y)
export type Rotation2d = number; // radians
export type Pose2d = {
  translation: Translation2d;
  rotation: Rotation2d;
};

export type Translation3d = [number, number, number]; // meters (x, y, z)
export type Rotation3d = [number, number, number, number]; // radians (w, x, y, z)
export type Pose3d = {
  translation: Translation3d;
  rotation: Rotation3d;
};

export type AprilTag = {
  id: number | null;
  pose: Pose3d;
};

export function translation2dTo3d(input: Translation2d, z: number = 0): Translation3d {
  return [...input, z];
}

export function rotation2dTo3d(input: Rotation2d): Rotation3d {
  let quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), input);
  return [quaternion.w, quaternion.x, quaternion.y, quaternion.z];
}

export function pose2dTo3d(input: Pose2d, z: number = 0): Pose3d {
  return {
    translation: translation2dTo3d(input.translation, z),
    rotation: rotation2dTo3d(input.rotation)
  };
}

export function rotation3dToQuaternion(input: Rotation3d): THREE.Quaternion {
  return new Quaternion(input[1], input[2], input[3], input[0]);
}

// LOG READING UTILITIES

export function logReadNumberArrayToPose2dArray(
  log: Log,
  key: string,
  timestamp: number,
  distanceConversion = 1,
  rotationConversion = 1
): Pose2d[] {
  let poses: Pose2d[] = [];
  let array = getOrDefault(log, key, LoggableType.NumberArray, timestamp, []);
  if (array.length === 2) {
    poses.push({
      translation: [array[0] * distanceConversion, array[1] * distanceConversion],
      rotation: 0
    });
  } else {
    for (let i = 0; i < array.length; i += 3) {
      poses.push({
        translation: [array[i] * distanceConversion, array[i + 1] * distanceConversion],
        rotation: array[i + 2] * rotationConversion
      });
    }
  }
  return poses;
}

export function logReadPose2d(
  log: Log,
  key: string,
  timestamp: number,
  distanceConversion = 1,
  rotationConversion = 1
): Pose2d | null {
  const x = getOrDefault(log, key + "/translation/x", LoggableType.Number, timestamp, null);
  const y = getOrDefault(log, key + "/translation/y", LoggableType.Number, timestamp, null);
  if (x === null || y === null) {
    return null;
  } else {
    return {
      translation: [x * distanceConversion, y * distanceConversion],
      rotation: getOrDefault(log, key + "/rotation/value", LoggableType.Number, timestamp, 0) * rotationConversion
    };
  }
}

export function logReadPose2dArray(
  log: Log,
  key: string,
  timestamp: number,
  distanceConversion = 1,
  rotationConversion = 1
): Pose2d[] {
  let length = getOrDefault(log, key + "/length", LoggableType.Number, timestamp, 0);
  let poses: Pose2d[] = [];
  for (let i = 0; i < length; i++) {
    poses.push({
      translation: [
        getOrDefault(log, key + "/" + i.toString() + "/translation/x", LoggableType.Number, timestamp, 0) *
          distanceConversion,
        getOrDefault(log, key + "/" + i.toString() + "/translation/y", LoggableType.Number, timestamp, 0) *
          distanceConversion
      ],
      rotation:
        getOrDefault(log, key + "/" + i.toString() + "/rotation/value", LoggableType.Number, timestamp, 0) *
        rotationConversion
    });
  }
  return poses;
}

export function logReadTranslation2dToPose2d(
  log: Log,
  key: string,
  timestamp: number,
  distanceConversion = 1
): Pose2d | null {
  const x = getOrDefault(log, key + "/x", LoggableType.Number, timestamp, null);
  const y = getOrDefault(log, key + "/y", LoggableType.Number, timestamp, null);
  if (x === null || y === null) {
    return null;
  } else {
    return {
      translation: [x * distanceConversion, y * distanceConversion],
      rotation: 0
    };
  }
}

export function logReadTranslation2dArrayToPose2dArray(
  log: Log,
  key: string,
  timestamp: number,
  distanceConversion = 1
): Pose2d[] {
  let length = getOrDefault(log, key + "/length", LoggableType.Number, timestamp, 0);
  let poses: Pose2d[] = [];
  for (let i = 0; i < length; i++) {
    poses.push({
      translation: [
        getOrDefault(log, key + "/" + i.toString() + "/x", LoggableType.Number, timestamp, 0) * distanceConversion,
        getOrDefault(log, key + "/" + i.toString() + "/y", LoggableType.Number, timestamp, 0) * distanceConversion
      ],
      rotation: 0
    });
  }
  return poses;
}

export function logReadTrajectoryToPose2dArray(
  log: Log,
  key: string,
  timestamp: number,
  distanceConversion = 1,
  rotationConversion = 1
): Pose2d[] {
  let length = getOrDefault(log, key + "/states/length", LoggableType.Number, timestamp, 0);
  let poses: Pose2d[] = [];
  for (let i = 0; i < length; i++) {
    poses.push({
      translation: [
        getOrDefault(log, key + "/states/" + i.toString() + "/pose/translation/x", LoggableType.Number, timestamp, 0) *
          distanceConversion,
        getOrDefault(log, key + "/states/" + i.toString() + "/pose/translation/y", LoggableType.Number, timestamp, 0) *
          distanceConversion
      ],
      rotation:
        getOrDefault(log, key + "/states/" + i.toString() + "/pose/rotation/value", LoggableType.Number, timestamp, 0) *
        rotationConversion
    });
  }
  return poses;
}

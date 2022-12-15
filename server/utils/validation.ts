import { IRoom } from "../../types/room"

export const validateExists = (props: any) => {
  const errors: string[] = [];
  Object.keys(props).forEach((key) => {
    if (!props[key]) {
      errors.push(`${key} is required`)
    }
  });

  return errors;
};

export const validateRoomExists = ({ roomCode, rooms }: any) => {
  const room = rooms.find((room: IRoom) => room.roomCode === roomCode);
  if (!room) {
    return true;
  }
  return false;
}
export const add = (a: number, b: number): number => a + b;

// function map<Input, OutPut>(arr: Input[], func: (arg: Input) => OutPut): OutPut[] {
//   return arr.map(func);
// }

// export const result = map([1, 2, 3], (n) => n * 2);
// console.log(result);

// export interface Box<Type> {
//   contents: Type;
// }

// export let boxA:Box<string> = { contents: "hello" };
// export let boxB:Box<number> = { contents: 42 };

// export type OrNull<Type>= Type | null;

// export type OneOrMany<Type> = Type | Type[];

// export type OneOrManyOrNull<Type> = OneOrMany<OrNull<Type>>

// export type OneOrManyOrNullString<Type> = OneOrManyOrNull<String>

// interface Lengthwise {
//   length: number;
// }

// function loggingIdentify<Type extends Lengthwise>(arg: Type): Type {
//   console.log(arg.length);
//   return arg;
// }

// loggingIdentify("hello");
// console.log(loggingIdentify)

// function getProperty<Type, Key extends keyof Type>(obj: Type, key: Key): Type[Key] {
//   return obj[key];
// }

// interface IdLabel {
//   id: number;
// }
// interface NameLabel {
//   name: string;
// }

// export type NameOrId<T extends string | number> = T extends number ? IdLabel : NameLabel;

// function createLabel<T extends number | string>(idOrName: T): NameOrId<T> {
//   throw "unimplemented";
// }
// export const l = createLabel(2);

// type GetReturnType<Type> = Type extends (...args: never[]) => infer Return ? Return : never;

// type Num = GetReturnType<() => number>;
// type Str = GetReturnType<(x: number) => string>;

// declare function stringOrNum(x: string): number;
// declare function stringOrNum(x: number): string;
// declare function stringOrNum(x: string | number): string | number;

// type T1 = ReturnType<typeof stringOrNum>

// function addNum(a: number, b: number): number {
//   return a + b;
// }

// type TyAddNum = typeof addNum

// type PropEventSource<Type> = {
//   on<Key extends string & keyof Type>(eventName: `${Key}Changed`, callback:(newValue: Type[Key]) => void): void;
// }

// declare function makeWatchedObject<Type>(obj: Type): Type & PropEventSource<Type>

// const person = makeWatchedObject({
//   firstName: '张三',
//   lastName: '里斯',
//   age: 26
// })

// person.on("firstNameChanged", newValue => {
//   console.log(newValue);
// })

// // typeOf
// const str1 = "hello world";
// type TypeOfStr1 = typeof str1;

// const obj = { name: '123', age: 10 };
// type TypeOfObj = typeof obj;

// const fn = (a: number) => a + 1;
// type TypeOfFn = typeof fn;
// type TypeOfReturnType = ReturnType<typeof fn>


// // keyOf

// interface User {
//   name: string,
//   age: number
// }
// type UserKeys = keyof User;

// type Obj = { a: 1, b: 2 }
// type ObjKeys = keyof Obj;

// type ArrKeys = keyof[]

// // in

// type Keys = 'name' | 'age';
// type InUser = { [K in Keys]: string }

// // extend
// type GetValue<T extends object> = T[keyof T]
// type GetValue1<T extends Obj> = T[keyof T]

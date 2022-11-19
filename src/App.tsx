import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import './App'
import { useAppDispatch, useAppSelector } from './hooks/redux'
import { fetchUsers } from './store/reducers/ActionCreators'
import { userSlice } from './store/reducers/UserSlice'

const App = () => {
	const dispatch = useAppDispatch();
	const { users, isLoading, error } = useAppSelector(state => state.userReducer)

	useEffect(() => {
		dispatch(fetchUsers())

	}, [])


	return (
		<div className='App'>
			{isLoading && <h1>Loading...</h1>}
			{error && <h1>{error}</h1>}
			{JSON.stringify(users, null, 2)}
		</div>
	)
}

export default App


/* я писал на чистом redux и можно сказать, создавал состояния для нескольких категорий 
(ну тип, для пользователей, для постов, для документов и т.п.), их достаточно много, и на каждую такую категорию надо 4 файла, 
как минимум (reducer, actions, types (если typescript), service) и их создание сводилось к copy/paste и 10 минутному переименованию, 
поэтому, когда вместо этих 4 файлов, нужен всего один (который по размеру меньше каждого из тех 4), это просто очень круто, спасибо. 
Хотелось бы, чтобы ты описал как переопределять baseQuery, например, для добавления accessToken-а в заголовок, или для переавторизации, 
в случае, если accessToken перестал действовать, просто, мне это надо было в моем приложении, в принципе у меня и так получилось найти 
как это сделать, но если бы было видео на эту тему, было бы супер, еще раз спасибо */


/* Мои пожелания делать видео не "галопом по европам" а глубже разбирать тему с большим количеством примеров и объяснений. 
Далее согласно документации extraReducers  с TypeScript следует реализовывать через builder: 
We recommend using the builder callback API as the default, especially if you are using TypeScript. */



/* Почему не очищаете timeout в useEffect на 31:28 ?) */



/* 

Для тех, у кого возникает ошибка с типизацией "e" в try...catch (e) {...} (15:14):

У ошибок в TS по умолчанию тип unknown, она может быть чем угодно (грубо говоря, мы можем сделать throw new Promise(() => {}) 
и это будем ошибка с типом Promise или, аналогично, throw 7 и это будет ошибка с типом number). 

Для того, чтобы избежать проблем с типизацией и крашей в рантайме я рекомендую использовать следующую функцию для получения message из error: 

function getErrorMessage(error: unknown) {
	 if (error instanceof Error) return error.message
	 return String(error)
}

Далее делаем следующее:

try {
 // логика
} catch (e) {
	 dispatch(userSlice.actions.usersFetchingError(getErrorMessage(e)))
}


// ====================

Можно просто выполнить приведение типов:
dispatch(userSlice.actions.usersFetchingError((e as Error).message))

// ====================

я описал в начале комментария, что ошибка не всегда может быть типа Error и иметь поле message. Обычно, конечно, это так, 
но если произойдет что-то непредвиденное - приложение сломается.
Лучше сразу привыкать к best practice, а не рефлекторному применению any и as

*/



/* 16:48 у кого ошибка не выводилась напишите так 		
if (e instanceof Error) {
dispatch(userSlice.actions.usersFetchingError(e.message));
} else {
console.log("Unexpected error", e);
} */



/* вопросик: есть два редюсера (обычный редакс) - auth и notify. 
При диспатче thunk наша thunk диспатчит action в auth, тем самым засовывает в state самого юзера, которого получили в запросе, 
затем диспатчит action в notify (сообщение что пользователь авторизовался).

Как можно сделать подобную логику с использованием createAsyncThunk? 

// =============

Кажется я нашёл ответ 
https://youtu.be/WFlDxQsvPeY
*/



/* В случае с createSelector и createAction типизировать useSelector и useDispatch смысла нет. 
К тому же, вынос селекторов в отдельный модуль позволяет инкапсулировать компоненты от логики получения данных из сторы. 
Получается, что источник истины для всех компонентов один */



/* 


Изучал RTK query, не очень понравилось, что при мутации нужно делать дополнительный get-запрос для получения актуальной информации. 
Тогда это не совсем мутации получаются, а перезагрузка кэша. Нет ли варианта, как через redux  через action например, при необходимости мутации, 
в случае успешного post запроса на обновление, докидывать новый элемент в конец списка и не делать доп. get-запрос?



Такой же вопрос возник. Хотелось бы просто после добавления поста добавить его в стейт, без перезарузки всех данных.


мне кажется тут варианты либо сокет юзай, либо крути данные через редакс и изменяй их локально тоже, 
соответственно и список ты выводишь из редакса, либо графкюл юзай, 
там с кэшем удобно работать, ну или делай какой то локальный стэйт в компоненте, 
ну бывает так что одни и теже данные нужны в разных компонентах так что думаю редакс норм

*/



/* Болин понимаю видос старый но надеюсь кто то ответит
в чем смысл export const useAppDispatch = useDispatch<AppDispatch>; он же ни каких проверок ничего не дает там Dispatch<anyAction>

не лучше ли использовать что то такое 

export const useAppDispatch: () => (actions: StoreActions) => void =
  useDispatch<AppDispatch>; */



/* 16:15

почему fetchUsers вызывется? он же ничего не возвращает. мне пришлось просто передавать функцию без вызова чтобы заработало */



/* Правильно ли я понимаю что при создании множества разных сервисов по средствам RTK query, нам нужно будет столько же раз с помощью
 .concat() прокидывать все новые и новые мидлвары, то есть "...().concat(postApi.middleware).concat(authApi.middleware).concat(poolsApi.middleware)" и тд 
 или все же есть более красивый вид записи? 
 
 [].concat(postApi.middleware, authApi.middleware, poolsApi.middleware)
 */



/* 
Привет, понятно почему мы используем useAppSelector, чтобы типизировать state
А зачем использовать useAppDispatch? Ты сказал это для того чтобы мы не смогли прокинуть неопределенные action, 
но ведь если мы попробуем толкнуть в useAppDispatch несуществующий reducer, то мы получим ошибку и TS compiler, 
так в чём тогда смысл useAppDispatch?
*/



/* 
Мне одна штука в ртк квери не понравилась. Он при мутации данных делает рефетч, это не всегда удобно. 
Иногда хочется обновить объект в стейте на основании ответа от например пост метода. И больше гет не вызывать.
*/



/* 
На 15:00 литнер ругается на отсутствие  поля message у ошибки e. На попытку задать тип (e: AxiosError) тоже матерится. 
Помогло только переопределить тип через as: 

Я так понял это из-за TS такое происходит, именно в блоке try/catch. В доке TS предлагают на error вещать тип any или unknown.


Как решил ? точно не помню уже. то ли 'e as Error' , то ли 'e.message as smth'
*/



/* На 9-ой минуте в нижнем примере "без" нужно убрать */



/* 15:13 catch (e: any) */



/* 24:00. Заранее спасибо!)) 
Обновление: правило "задай вопрос и сразу поймешь проблему" сработало))) просто из неправильного места импортировала createApi */



/* 

Очень важный вопрос, в итоге RTK query нужно юзать отдельно или его так же можно соединить с Redux Toolkit? 
Например у меня есть задача добавить в стор активные язык и тему приложения + взаимодействие с беком, 
получается бек я обрабатываю RTK query, а тему и язык я провожу через slice и в итоге свожу в combineReducers? 
Или есть решение все провести через RTK query?





открыл документацию по RTK query и там сразу написано - что это доп модуль к Toolkit  и он включен туда по умолчанию. 
Получаться все данные з RTK query попадают в стор, оттуда ты их и достаёшь через хук. 
Я сам еще не работал с Redux Toolkit но выглядит все так




 ну вот я тоже так подумал, но если мне нужно в стор еще дополнительно что-то класть, не через RTK query, 
 то получается что у меня будут слайсы и апишки от RTK query собираться в одном месте, вообщем интересно, нужно пробовать

*/



/* 

если у кого-то возникает ошибка как у меня: Uncaught ReferenceError: 
Cannot access fetchUsers before initialization within a redux toolkit slice
то надо extraReducers заменить на:
```
extraReducers: (builder) => {
	 builder
		.addCase(fetchUsers.pending, (state) => {
		  state.isLoading = true;
		})
		.addCase(fetchUsers.fulfilled, (state, action: PayloadAction<IUser[]>) => {
		  state.isLoading = false;
		  state.error = '';
		  state.users = action.payload;
		})
		.addCase(fetchUsers.rejected, (state, action) => {
		  state.isLoading = false;
		  state.error = action.payload as string;
		});
  },
```
то есть надо сделать функцию обертку

*/



/* 


Не понимаю, почему при запросе через rtk query происходит три перерисовки. 
Во всяком случае в консоль логе запрос = 3 дубля консоль лога. Мне кажется это не нормальным



Если корневой компонент обернут в strictMode в index.js, это от него



*/



/* 

Подскажите пожалуйста на примере желательно :  как решить ошибку в блоке try {
} catch (e) {
 dispatch(userSlice.actions.usersFetchingError(e.message));
} 
ОБЬЕКТ (е) ИМЕЕТ ТИП НЕИЗВЕСТНЫЙ - как это разрулить...???

// ==========
catch (e:any)



// =============
catch (e) {
const error = e as AxiosError;
 dispatch(userSlice.actions.usersFetchingError(error.message));
}
// ==========
15:10 
catch (e) {
	 const error = e as AxiosError
	 dispatch(userSlice.actions.usersFetchingError(error.message))
  }


*/



/* 
как импортировали userReducer если нет на userSlice?


Дефолтный экспорт можно по другому назвать во время импорта.

*/



/*Якщо э проблеми з запуском json-server  - попробуйте:
npx json-server --watch db.json --port 5000  */



/* Всем привет, а никто не сталкивался с тем как работать с RTK Query если на сервере есть CORS? 
Как быть если обращение через query всегда возращает ошибки CORS?

	В общем сам же и отвечаю. Решил через setupProxy.js в корне паркета и http-proxy-midlleare */



/* 

как в блоке
 try {} cach(e){ 
console.log(e.message)
}
 "е" выдает ошибку ts Catch clause variable type annotation must be 'any' or 'unknown' if specified
и как это исправить


(e as Error).message


добавьте правило "useUnknownInCatchVariables": false в файле tsonfig.json

*/



/*


на минуте 16,06 когда диспатчим  dispatch(fetchUsers(...)) тайпскрипт ругается что параметр не передаём, но на видео всё работает, кто знает причину?


по идее всё работает. Я сам пару раз запаривался и упускал мелкие детали. Потом дебажил свою внимательность и работало.
Кто ж знает чего ты там пропустил?

*/



/*  */



/*  */



/*  */



/*  */



/*  */



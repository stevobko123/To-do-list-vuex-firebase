import { createStore } from "vuex";
const store = createStore({
  state() {
    return {
      lists: [],
    };
  },
  getters: {
    lists(state) {
      return state.lists;
    },
  },

  mutations: {
    // aktuálne listy
    setLists(state, payload) {
      state.lists = payload;
    },

    //// Prida todo
    addNewTask(state, payload) {
      state.lists.map((list) => {
        if (list.idList === payload.idList) {
          list.todoes.push(payload);
        }
      });
    },
    // odoberie TODO z ARR TODOES
    removeTodo(state, payload) {
      state.lists.map((list) => {
        list.todoes = list.todoes.filter(
          (todo) => todo.idTodo !== payload.idTodo
        );
      });
    },
    // pridá nový TODOLIST do ARR LISTS
    addNewTodolist(state, payload) {
      state.lists.unshift(payload);
    },
    // odoberie TODOLIST z ARR LISTS
    deleteTodolistFromArr(state, payload) {
      state.lists = state.lists.filter((list) => list.idList !== payload);
    },
    // po zvolení listu vieme prepisať
    submitNewName(state, payload) {
      state.lists.map((list) => {
        if (list.idList === payload.idList) {
          list.header = payload.header;
        }
      });
    },
    // done --> not done --> done
    changeState(state, payload) {
      console.log(payload);
      state.lists.map((list) => {
        if (list.idList === payload.idList) {
          list.todoes.isDone = payload.isDone;
        }
      });
    },
  },

  actions: {
    // LOAD LISTS FROM DATABASE
    async loadLists(context) {
      const response = await fetch(
        `https://whattodostevo-default-rtdb.firebaseio.com/lists.json`
      );
      const responseData = await response.json();
      if (!response.ok) {
        // err handling
        const error = new Error(responseData.message || "FAIL TO FETCH ");
        throw error;
      }

      const lists = [];
      for (const key in responseData) {
        const list = {
          idList: key,
          header: responseData[key].header,
          todoes: Object.values(responseData[key].todoes),
        };

        lists.push(list);
      }

      context.commit("setLists", lists);
    },

    //// ADD NEW TODO TO TODOES --------------------------->
    async addNewTask(context, payload) {
      const idList = payload.idList;
      const idTodo = payload.idTodo;
      const newTodo = {
        ...payload,
      };
      const response = await fetch(
        `https://whattodostevo-default-rtdb.firebaseio.com/lists/${idList}/todoes/${idTodo}.json`,
        {
          method: "PUT",
          body: JSON.stringify(newTodo),
        }
      );
      if (!response.ok) {
        //err handling
      }
      context.commit("addNewTask", newTodo);
    },
    //// REMOVE TODO FROM TODOES --------------
    async removeTodo(context, payload) {
      const idList = payload.idList;
      const idTodo = payload.idTodo;
      const response = await fetch(
        `https://whattodostevo-default-rtdb.firebaseio.com/lists/${idList}/todoes/${idTodo}.json`,
        {
          method: "DELETE",
          body: JSON.stringify(idTodo),
        }
      );
      if (!response.ok) {
        //.. err handling
      }
      context.commit("removeTodo", {
        idList: idList,
        idTodo: idTodo,
      });
    },
    //// ADD NEW TODOLIST IN LISTS
    async createNewTodoList(context, payload) {
      const id = payload.idList;
      const list = {
        header: payload.header,
        todoes: [],
        idList: payload.idList,
      };
      const response = await fetch(
        `https://whattodostevo-default-rtdb.firebaseio.com/lists/${id}.json`,
        {
          method: "PUT",
          body: JSON.stringify(list),
        }
      );
      if (!response.ok) {
        //...err handling
      }

      context.commit("addNewTodolist", list);
    },
    //// REMOVE TODOLIST FROM LISTS
    async deleteTodolistFromArr(context, payload) {
      const idList = payload;
      const response = await fetch(
        `https://whattodostevo-default-rtdb.firebaseio.com/lists/${idList}.json`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        // err.handling
      }

      context.commit("deleteTodolistFromArr", payload);
    },
    //// CHANGE NAME OF YOUR TODOLIST
    async submitNewName(context, payload) {
      const idList = payload.idList;
      const newHeader = {
        idList: payload.idList,
        header: payload.header,
      };
      const response = await fetch(
        `https://whattodostevo-default-rtdb.firebaseio.com/lists/${idList}.json`,
        {
          method: "PATCH",
          body: JSON.stringify(newHeader),
        }
      );
      if (!response.ok) {
        //...err handling
      }
      context.commit("submitNewName", newHeader);
    },
    //// CHANGE STATE DONE || NOT DONE
    async changeState(context, payload) {
      console.log(payload);
      const idList = payload.idList;
      const idTodo = payload.item.idTodo;

      const todo = {
        isDone: payload.item.isDone,
        idTodo: payload.item.idTodo,
        idList: payload.idList,
      };
      const response = await fetch(
        `https://whattodostevo-default-rtdb.firebaseio.com/lists/${idList}/todoes/${idTodo}.json`,
        {
          method: "PATCH",
          body: JSON.stringify(todo),
        }
      );

      if (!response.ok) {
        //...err handling
      }
      context.dispatch("loadLists");
      context.commit("changeState", todo);
    },
  },
});

export default store;